import validator from "validator"
import inquiryModel from "../models/inquiryModel.js"

// Public: submit a bulk-order inquiry.
const addInquiry = async (req, res) => {
    try {
        const { name, quantity, location, contact, email, category, productLink, country, purpose, message } = req.body

        if (!name || !name.trim()) return res.json({ success: false, message: "Name is required" })
        if (!email || !validator.isEmail(email)) return res.json({ success: false, message: "A valid email is required" })
        if (!contact || !contact.trim()) return res.json({ success: false, message: "Contact number is required" })

        const inquiry = new inquiryModel({
            name: name.trim(),
            quantity: (quantity || "").toString(),
            location: location || "",
            contact: contact || "",
            email: email.trim(),
            category: category || "",
            productLink: productLink || "",
            country: country || "",
            purpose: purpose || "",
            message: message || "",
            date: Date.now(),
        })
        await inquiry.save()

        res.json({ success: true, message: "Your bulk order inquiry has been submitted. We'll get back to you soon!" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: list all inquiries (newest first).
const listInquiries = async (req, res) => {
    try {
        const inquiries = await inquiryModel.find({}).sort({ date: -1 })
        res.json({ success: true, inquiries })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: delete an inquiry.
const removeInquiry = async (req, res) => {
    try {
        await inquiryModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Inquiry removed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addInquiry, listInquiries, removeInquiry }
