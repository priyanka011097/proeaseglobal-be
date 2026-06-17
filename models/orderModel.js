import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },        // INR for India orders, USD for abroad
    promoCode: { type: String, default: '' },           // applied discount code, if any
    discount: { type: Number, default: 0 },             // discount amount in the order currency
    address: { type: Object, required: true },
    status: { type: String, required: true, default:'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true , default: false },
    stockDeducted: { type: Boolean, default: false },   // stock reduced once on delivery
    shiprocket: { type: Object, default: {} },          // { orderId, shipmentId, status }
    date: {type: Number, required:true}
})

const orderModel = mongoose.models.order || mongoose.model('order',orderSchema)
export default orderModel;