import faqModel from "../models/faqModel.js"

const defaults = {
    items: [
        { question: "How long does delivery take?", answer: "Orders are typically dispatched within 1–2 business days and delivered within 5–7 business days, depending on your location." },
        { question: "Do you ship worldwide?", answer: "Yes, we ship across India and to most international destinations. Shipping charges are calculated at checkout." },
        { question: "What is your return policy?", answer: "We offer hassle-free returns within 7 days of delivery for unused items in their original condition." },
        { question: "Which payment methods do you accept?", answer: "We accept UPI, major credit/debit cards, net banking, and popular wallets." },
    ],
}

const getFaq = async (req, res) => {
    try {
        const faq = await faqModel.findOne({})
        res.json({ success: true, faq: faq || defaults })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateFaq = async (req, res) => {
    try {
        const items = Array.isArray(req.body.items)
            ? req.body.items
                .filter((it) => it && typeof it.question === 'string' && it.question.trim() !== '')
                .map((it) => ({ question: it.question, answer: it.answer || '' }))
            : defaults.items

        const faq = await faqModel.findOneAndUpdate({}, { items }, { new: true, upsert: true })
        res.json({ success: true, message: "FAQ Updated", faq })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getFaq, updateFaq }
