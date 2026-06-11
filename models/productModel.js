import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller: { type: Boolean },
    color: { type: String, default: "" },
    fabric: { type: String, default: "" },
    details: { type: Array, default: [] },   // [{ label, value }] spec table
    stock: { type: Array, default: [] },     // [{ size, stock }] per-size stock
    sku: { type: String, default: "" },   // used to dedupe bulk imports
    date: { type: Number, required: true }
})

const productModel  = mongoose.models.product || mongoose.model("product",productSchema);

export default productModel