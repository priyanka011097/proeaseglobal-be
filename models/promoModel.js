import mongoose from "mongoose";

// A discount/promo code. `value` is a percent (type 'percent') or a flat amount
// in INR (type 'flat'). minOrder is also in INR.
const promoSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value: { type: Number, required: true },
    minOrder: { type: Number, default: 0 },     // minimum order subtotal (INR) to qualify
    active: { type: Boolean, default: true },
    expiresAt: { type: Number, default: 0 },     // epoch ms; 0 = never expires
    usageLimit: { type: Number, default: 0 },    // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    date: { type: Number, default: () => Date.now() },
})

const promoModel = mongoose.models.promo || mongoose.model("promo", promoSchema);

export default promoModel
