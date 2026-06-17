// Minimal Shiprocket API client (auth + create order). Uses Node's global
// fetch (Node 18+). Configure via env: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD,
// SHIPROCKET_PICKUP_LOCATION (the pickup nickname set up in your Shiprocket panel).
const BASE = 'https://apiv2.shiprocket.in/v1/external'

let cachedToken = null
let tokenExpiry = 0

const getToken = async () => {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken

    const email = process.env.SHIPROCKET_EMAIL
    const password = process.env.SHIPROCKET_PASSWORD
    if (!email || !password) {
        throw new Error('Shiprocket is not configured (set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD).')
    }

    const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data?.token) throw new Error(data?.message || 'Shiprocket authentication failed')

    cachedToken = data.token
    tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000 // token lasts ~10 days
    return cachedToken
}

const pad = (n) => String(n).padStart(2, '0')

// Resolve the pickup pincode for the configured pickup location (cached).
let cachedPickupPincode = null
export const getPickupPincode = async () => {
    if (cachedPickupPincode) return cachedPickupPincode
    const token = await getToken()
    const res = await fetch(`${BASE}/settings/company/pickup`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    const list = data?.data?.shipping_address || []
    const wanted = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary'
    const match = list.find((a) => a.pickup_location === wanted) || list[0]
    cachedPickupPincode = match?.pin_code ? String(match.pin_code) : null
    return cachedPickupPincode
}

// Cheapest courier rate (INR) from pickup → delivery pincode for a given weight.
// Returns null when no courier services the route (e.g. international pincodes).
export const getShippingRate = async (deliveryPincode, weight = 0.5, cod = 0) => {
    const token = await getToken()
    const pickup = await getPickupPincode()
    if (!pickup || !deliveryPincode) return null

    const url = `${BASE}/courier/serviceability/?pickup_postcode=${pickup}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    const couriers = data?.data?.available_courier_companies || []
    if (!couriers.length) return null

    // Always charge the customer the cheapest serviceable courier for this route.
    // Consider every courier returned; ignore invalid/zero quotes.
    let best = null
    for (const c of couriers) {
        const r = Number(c.rate)
        if (!Number.isFinite(r) || r <= 0) continue
        if (best === null || r < best.rate) best = { rate: r, courier: c.courier_name }
    }
    if (!best) return null
    return Math.ceil(best.rate)
}

// Create a Shiprocket order from one of our orders.
export const createShipment = async (order) => {
    const token = await getToken()
    const a = order.address || {}

    const items = (order.items || []).map((i) => ({
        name: (i.name || 'Item').toString(),
        sku: (i.sku || i._id || 'SKU').toString(),
        units: Number(i.quantity) || 1,
        selling_price: Number(i.price) || 0,
    }))
    const subTotal = items.reduce((s, i) => s + i.selling_price * i.units, 0)
    const totalUnits = items.reduce((s, i) => s + i.units, 0) || 1

    const d = new Date(order.date || Date.now())
    const orderDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`

    const payload = {
        order_id: order._id.toString(),
        order_date: orderDate,
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
        billing_customer_name: a.firstName || 'Customer',
        billing_last_name: a.lastName || '',
        billing_address: a.street || '',
        billing_city: a.city || '',
        billing_pincode: (a.zipcode || '').toString(),
        billing_state: a.state || '',
        billing_country: a.country || 'India',
        billing_email: a.email || '',
        billing_phone: (a.phone || '').toString(),
        shipping_is_billing: true,
        order_items: items,
        payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        sub_total: subTotal,
        // No per-product dimensions yet — sensible package defaults (cm / kg).
        length: 25,
        breadth: 20,
        height: 5,
        weight: Math.max(0.3, totalUnits * 0.3),   // ~0.3 kg per item
    }

    const res = await fetch(`${BASE}/orders/create/adhoc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data?.order_id && !data?.shipment_id) {
        throw new Error(data?.message || 'Shiprocket order creation failed')
    }
    return data // { order_id, shipment_id, status, status_code, ... }
}
