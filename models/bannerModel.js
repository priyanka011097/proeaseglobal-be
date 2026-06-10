import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    // Separate artwork for each viewport. mobileImage falls back to desktop.
    desktopImage: { type: String, required: true },
    mobileImage: { type: String, default: "" },
    heading: { type: String, default: "" },
    subText: { type: String, default: "" },
    offer: { type: String, default: "" },
    link: { type: String, default: "" },
    date: { type: Number, required: true }
})

const bannerModel = mongoose.models.banner || mongoose.model("banner", bannerSchema);

export default bannerModel
