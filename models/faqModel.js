import mongoose from "mongoose";

const qaSchema = new mongoose.Schema({
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
}, { _id: false })

// Editable FAQ content for the storefront. Single document.
const faqSchema = new mongoose.Schema({
    items: {
        type: [qaSchema],
        default: [
            { question: "How long does delivery take?", answer: "Orders are typically delivered within 8 to 14 days, depending on your location." },
            { question: "Do you ship worldwide?", answer: "Yes, we ship across India and to most international destinations. Shipping charges are calculated at checkout." },
            { question: "What is your return policy?", answer: "We offer hassle-free returns within 7 days of delivery for unused items in their original condition." },
            { question: "Which payment methods do you accept?", answer: "We accept UPI, major credit/debit cards, net banking, and popular wallets." },
        ],
    },
})

const faqModel = mongoose.models.faq || mongoose.model("faq", faqSchema);

export default faqModel
