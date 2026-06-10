import mongoose from "mongoose";

// One column: an icon (chosen from a preset set) + a single line of text.
const itemSchema = new mongoose.Schema({
    icon: { type: String, default: "truck" },
    text: { type: String, default: "" },
}, { _id: false })

// Editable content for the storefront trust-badges row. Single document.
const trustSchema = new mongoose.Schema({
    items: {
        type: [itemSchema],
        default: [
            { icon: "truck", text: "Worldwide Shipping" },
            { icon: "shield", text: "Quality Product" },
            { icon: "refresh", text: "Easy Returns" },
        ],
    },
    active: { type: Boolean, default: true },
})

const trustModel = mongoose.models.trust || mongoose.model("trust", trustSchema);

export default trustModel
