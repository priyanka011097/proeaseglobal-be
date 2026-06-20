import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"

// Approximate INR per 1 USD, used only to put mixed-currency orders on one scale
// for ranking/heat intensity. Display cards keep INR and USD separate.
const USD_TO_INR = 88

// Build all dashboard analytics in one pass over the orders.
const getStats = async (req, res) => {
    try {
        const [orders, userCount, products] = await Promise.all([
            orderModel.find({}),
            userModel.countDocuments({}),
            productModel.find({}, 'name image category'),
        ])

        // Quick lookup so best-seller rows can show a product image even if the
        // order item didn't store one.
        const productById = {}
        products.forEach((p) => { productById[p._id.toString()] = p })

        const inrEquiv = (amount, currency) =>
            (String(currency).toUpperCase() === 'USD' ? Number(amount || 0) * USD_TO_INR : Number(amount || 0))

        let revenueINR = 0, revenueUSD = 0, paidOrders = 0
        const statusBreakdown = {}
        const dayMap = {}            // 'YYYY-MM-DD' -> { inr, usd, orders }
        const bestSellers = {}       // key -> { name, productId, image, units, revenueINR }
        const categories = {}        // category -> { units, revenueINR }
        const pincodes = {}          // pincode -> { pincode, city, state, orders, units, revenueINR }
        const states = {}            // state -> { orders, revenueINR }

        // Last 30 days window for the trend chart.
        const DAY = 24 * 60 * 60 * 1000
        const since = Date.now() - 30 * DAY

        for (const o of orders) {
            statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1

            const isPaid = o.payment === true
            const cur = String(o.currency || 'INR').toUpperCase()

            if (isPaid) {
                paidOrders += 1
                if (cur === 'USD') revenueUSD += Number(o.amount || 0)
                else revenueINR += Number(o.amount || 0)

                // Daily trend (paid orders only).
                if (o.date && o.date >= since) {
                    const d = new Date(o.date).toISOString().slice(0, 10)
                    if (!dayMap[d]) dayMap[d] = { inr: 0, usd: 0, orders: 0 }
                    if (cur === 'USD') dayMap[d].usd += Number(o.amount || 0)
                    else dayMap[d].inr += Number(o.amount || 0)
                    dayMap[d].orders += 1
                }

                // Best sellers + categories (paid orders only).
                for (const it of (o.items || [])) {
                    const qty = Number(it.quantity || 0)
                    if (qty <= 0) continue
                    const lineINR = inrEquiv(Number(it.price || 0) * qty, it.currency || cur)

                    const key = (it._id && it._id.toString()) || it.name || 'unknown'
                    if (!bestSellers[key]) {
                        const prod = it._id ? productById[it._id.toString()] : null
                        bestSellers[key] = {
                            name: it.name || prod?.name || 'Unknown',
                            productId: it._id || null,
                            image: (it.image && it.image[0]) || (prod?.image && prod.image[0]) || '',
                            units: 0, revenueINR: 0,
                        }
                    }
                    bestSellers[key].units += qty
                    bestSellers[key].revenueINR += lineINR

                    const cat = it.category || productById[key]?.category || 'Uncategorized'
                    if (!categories[cat]) categories[cat] = { units: 0, revenueINR: 0 }
                    categories[cat].units += qty
                    categories[cat].revenueINR += lineINR
                }

                // Location heatmap (paid orders only).
                const addr = o.address || {}
                const pin = String(addr.zipcode || '').trim() || 'Unknown'
                const units = (o.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0)
                const oINR = inrEquiv(o.amount, cur)
                if (!pincodes[pin]) pincodes[pin] = { pincode: pin, city: addr.city || '', state: addr.state || '', orders: 0, units: 0, revenueINR: 0 }
                pincodes[pin].orders += 1
                pincodes[pin].units += units
                pincodes[pin].revenueINR += oINR
                if (!pincodes[pin].city && addr.city) pincodes[pin].city = addr.city
                if (!pincodes[pin].state && addr.state) pincodes[pin].state = addr.state

                const st = (addr.state || 'Unknown').trim() || 'Unknown'
                if (!states[st]) states[st] = { state: st, orders: 0, revenueINR: 0 }
                states[st].orders += 1
                states[st].revenueINR += oINR
            }
        }

        // Fill the 30-day trend with zero days so the chart is continuous.
        const trend = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * DAY).toISOString().slice(0, 10)
            const e = dayMap[d] || { inr: 0, usd: 0, orders: 0 }
            trend.push({ date: d, inr: Math.round(e.inr), usd: Math.round(e.usd * 100) / 100, orders: e.orders })
        }

        const sortByRevenue = (obj, extra = {}) =>
            Object.entries(obj).map(([k, v]) => ({ key: k, ...v, ...extra }))
                .sort((a, b) => b.revenueINR - a.revenueINR)

        res.json({
            success: true,
            stats: {
                users: userCount,
                totalOrders: orders.length,
                paidOrders,
                revenueINR: Math.round(revenueINR),
                revenueUSD: Math.round(revenueUSD * 100) / 100,
                avgOrderValueINR: paidOrders ? Math.round((revenueINR + revenueUSD * USD_TO_INR) / paidOrders) : 0,
                statusBreakdown,
                trend,
                bestSellers: Object.values(bestSellers)
                    .map((b) => ({ ...b, revenueINR: Math.round(b.revenueINR) }))
                    .sort((a, b) => b.units - a.units).slice(0, 10),
                topCategories: sortByRevenue(categories).map((c) => ({ name: c.key, units: c.units, revenueINR: Math.round(c.revenueINR) })).slice(0, 8),
                locations: Object.values(pincodes).map((p) => ({ ...p, revenueINR: Math.round(p.revenueINR) }))
                    .sort((a, b) => b.revenueINR - a.revenueINR),
                topStates: sortByRevenue(states).map((s) => ({ state: s.key, orders: s.orders, revenueINR: Math.round(s.revenueINR) })).slice(0, 10),
            },
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getStats }
