import mongoose from "mongoose";

// Editable content for the storefront's cashback / offer strip.
// Stored as a single document (singleton).
const offerSchema = new mongoose.Schema({
    prefix: { type: String, default: "GET UPTO" },
    highlight: { type: String, default: "15%" },
    suffix: { type: String, default: "CASH BACK" },
    subText: { type: String, default: "ON SELECT PAYMENT METHODS" },
    rightTitle: { type: String, default: "Wallet Offers" },
    rightText: { type: String, default: "On Orders Above ₹2999" },
    active: { type: Boolean, default: true },
})

const offerModel = mongoose.models.offer || mongoose.model("offer", offerSchema);

export default offerModel
