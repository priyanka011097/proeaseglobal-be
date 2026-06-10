import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
    label: { type: String, default: "" },
    url: { type: String, default: "/" },
}, { _id: false })

// An icon (chosen from a preset set) paired with a heading.
const featureSchema = new mongoose.Schema({
    icon: { type: String, default: "truck" },
    heading: { type: String, default: "" },
}, { _id: false })

// Editable content for the storefront footer. Stored as a single document.
const footerSchema = new mongoose.Schema({
    brandName: { type: String, default: "PROEASE GLOBAL" },
    features: {
        type: [featureSchema],
        default: [
            { icon: "truck", heading: "Hassle-Free Delivery" },
            { icon: "globe", heading: "Ships Worldwide" },
            { icon: "shield", heading: "100% Money Back Guarantee" },
        ],
    },
    description: { type: String, default: "Quality products, handcrafted with care. Bringing premium materials to your home and business." },
    quickLinksTitle: { type: String, default: "Quick Links" },
    quickLinks: { type: [linkSchema], default: [] },
    contactTitle: { type: String, default: "Get in Touch" },
    email: { type: String, default: "info@proeaseglobal.com" },
    phone: { type: String, default: "+91 91369 61528" },
    hours: { type: String, default: "Mon – Sat, 10am – 7pm" },
    copyright: { type: String, default: "© 2026 Proease Global. All rights reserved." },
    tagline: { type: String, default: "Made with care." },
})

const footerModel = mongoose.models.footer || mongoose.model("footer", footerSchema);

export default footerModel
