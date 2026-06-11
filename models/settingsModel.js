import mongoose from "mongoose";

// Global site settings (logo / branding). Stored as a single document.
const settingsSchema = new mongoose.Schema({
    logo: { type: String, default: "" },          // uploaded logo image URL ("" = use built-in mark)
    brandName: { type: String, default: "PROEASEGLOBAL" },
    // Header placement & framing of the logo
    logoPosition: { type: String, default: "left" },   // left | center | right
    logoHeight: { type: Number, default: 56 },          // px
    logoWidth: { type: Number, default: 0 },            // px (0 = auto width)
    logoFit: { type: String, default: "contain" },      // contain (whole logo) | cover (crop to fill)
    logoPosX: { type: Number, default: 50 },            // object-position X % (for cropping/panning)
    logoPosY: { type: Number, default: 50 },            // object-position Y %
    // Top announcement bar
    announcementText: { type: String, default: "" },
    announcementActive: { type: Boolean, default: false },
    announcementLink: { type: String, default: "" },
    // Storefront theme colors
    themeBg: { type: String, default: "#FFF6F2" },
    themeText: { type: String, default: "#2B2B2B" },
    // SEO / metadata
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    seoKeywords: { type: String, default: "" },
    seoImage: { type: String, default: "" },   // social share (Open Graph) image
})

const settingsModel = mongoose.models.settings || mongoose.model("settings", settingsSchema);

export default settingsModel
