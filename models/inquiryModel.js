import mongoose from "mongoose";

// A bulk-order inquiry submitted from the storefront.
const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: String, default: "" },
    location: { type: String, default: "" },
    contact: { type: String, default: "" },
    email: { type: String, required: true },
    category: { type: String, default: "" },
    productLink: { type: String, default: "" },
    country: { type: String, default: "" },
    purpose: { type: String, default: "" },
    message: { type: String, default: "" },
    date: { type: Number, required: true },
})

const inquiryModel = mongoose.models.inquiry || mongoose.model("inquiry", inquirySchema);

export default inquiryModel
