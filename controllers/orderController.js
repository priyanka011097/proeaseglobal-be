import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import promoModel from "../models/promoModel.js";
import { createShipment, getShippingRate } from "../utils/shiprocket.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharge = 50

// gateway initialize (lazy: only created when a payment route is actually used,
// so missing/placeholder payment keys don't crash the whole app at startup)
let stripeInstance = null
const getStripe = () => {
    if (!stripeInstance) stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
    return stripeInstance
}

let razorpayInstance = null
const getRazorpay = () => {
    if (!razorpayInstance) {
        razorpayInstance = new razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
    }
    return razorpayInstance
}

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address, currency: orderCurrency } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            currency: (orderCurrency || 'INR').toUpperCase(),
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name:item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name:'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await getStripe().checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({success:true,session_url:session.url});

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Stripe 
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            res.json({success: true});
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Public: quote the shipping charge (INR) to a destination pincode by weight.
const shippingRate = async (req, res) => {
    try {
        const { pincode, weight } = req.body
        const rate = await getShippingRate(String(pincode || ''), Number(weight) || 0.5, 0)
        res.json({ success: true, rate })   // rate is INR, or null if unserviceable
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message, rate: null })
    }
}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    try {
        
        const { userId, items, amount, address, currency: orderCurrency, promoCode, discount } = req.body

        const cur = (orderCurrency || currency).toUpperCase()

        // Free order (e.g. a 100%-off promo): Razorpay can't process a 0 amount,
        // so place it directly as paid and skip the gateway.
        if (!(Number(amount) > 0)) {
            const freeOrder = await orderModel.create({
                userId, items, address, amount: 0, currency: cur,
                promoCode: promoCode || '', discount: Number(discount) || 0,
                paymentMethod: 'Free', payment: true, date: Date.now(),
            })
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            if (promoCode) await promoModel.updateOne({ code: promoCode }, { $inc: { usedCount: 1 } })
            return res.json({ success: true, free: true, message: 'Order placed', orderId: freeOrder._id })
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            currency: cur,
            promoCode: promoCode || '',
            discount: Number(discount) || 0,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: Math.round(amount * 100),
            currency: cur,
            receipt : newOrder._id.toString()
        }

        await getRazorpay().orders.create(options, (error,order)=>{
            if (error) {
                console.log(error)
                return res.json({success:false, message: error})
            }
            res.json({success:true,order})
        })

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const verifyRazorpay = async (req,res) => {
    try {
        
        const { userId, razorpay_order_id  } = req.body

        const orderInfo = await getRazorpay().orders.fetch(razorpay_order_id)
        if (orderInfo.status === 'paid') {
            const paidOrder = await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            // Count promo usage now that payment is confirmed.
            if (paidOrder?.promoCode) {
                await promoModel.updateOne({ code: paidOrder.promoCode }, { $inc: { usedCount: 1 } })
            }
            res.json({ success: true, message: "Payment Successful" })
        } else {
            // Payment not completed — remove the placeholder order so it never
            // shows up as a "placed" order.
            await orderModel.findByIdAndDelete(orderInfo.receipt)
            res.json({ success: false, message: 'Payment Failed' });
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {

        // Hide online-payment orders that were never actually paid (abandoned checkout).
        const orders = await orderModel.find({ $or: [{ payment: true }, { paymentMethod: 'COD' }] })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId, $or: [{ payment: true }, { paymentMethod: 'COD' }] })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {

        const { orderId, status } = req.body

        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })

        // Reduce per-size stock once, when the order is marked Delivered.
        if (status === 'Delivered' && !order.stockDeducted) {
            for (const item of (order.items || [])) {
                if (!item || !item.size) continue
                const qty = Number(item.quantity) || 0
                if (qty <= 0) continue
                // Match by id; fall back to SKU (id changes if a product was re-imported).
                let product = null
                if (item._id) product = await productModel.findById(item._id).catch(() => null)
                if (!product && item.sku) product = await productModel.findOne({ sku: item.sku })
                if (!product || !Array.isArray(product.stock)) continue
                const entry = product.stock.find((s) => s.size === item.size)
                if (entry) {
                    entry.stock = Math.max(0, (Number(entry.stock) || 0) - qty)
                    product.markModified('stock')
                    await product.save()
                }
            }
            order.stockDeducted = true
        }

        order.status = status
        await order.save()
        res.json({ success: true, message: 'Status Updated' })

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Admin: push an order to Shiprocket (creates the shipment in your panel).
const pushToShiprocket = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.shiprocket && order.shiprocket.shipmentId) {
            return res.json({ success: false, message: 'This order was already pushed to Shiprocket.' })
        }

        const data = await createShipment(order)
        order.shiprocket = {
            orderId: data.order_id,
            shipmentId: data.shipment_id,
            status: data.status || 'NEW',
        }
        order.markModified('shiprocket')
        await order.save()

        res.json({ success: true, message: 'Order pushed to Shiprocket', shiprocket: order.shiprocket })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Delete ALL orders (admin bulk action)
const removeAllOrders = async (req, res) => {
    try {
        const result = await orderModel.deleteMany({})
        res.json({ success: true, message: `Deleted ${result.deletedCount} order(s)` })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, pushToShiprocket, removeAllOrders, shippingRate}