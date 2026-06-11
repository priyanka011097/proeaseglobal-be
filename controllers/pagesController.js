import { v2 as cloudinary } from "cloudinary"
import pagesModel from "../models/pagesModel.js"

const defaults = {
    about: {
        image: "",
        text1: "ProEase Global was born out of a passion for quality and craftsmanship — a desire to bring premium, thoughtfully made products to homes and businesses everywhere.",
        text2: "Since our beginning, we've worked to curate a diverse selection of high-quality products, sourced from trusted makers and suppliers, that cater to every taste and need.",
        missionTitle: "Our Mission",
        missionText: "Our mission is to empower customers with choice, convenience, and confidence — delivering a seamless experience from browsing to delivery and beyond.",
        visionTitle: "Our Vision",
        visionText: "To create a world-class global marketplace where customers can confidently meet their buying needs through our curated selection of quality products, backed by trust, innovation, and exceptional service.",
        points: [
            { title: "Quality Assurance", text: "We meticulously select and vet each product to ensure it meets our stringent quality standards." },
            { title: "Convenience", text: "With our user-friendly interface and hassle-free ordering process, shopping has never been easier." },
            { title: "Exceptional Customer Service", text: "Our dedicated team is here to assist you every step of the way — your satisfaction is our priority." },
        ],
    },
    contact: {
        image: "",
        storeTitle: "Our Store",
        address: "Near Bombay Plaza, Suite 350, Rajkot, Gujarat, India",
        phone: "+91 91369 61528",
        email: "info@proeaseglobal.com",
        careersTitle: "Careers at ProEase Global",
        careersText: "Learn more about our teams and job openings.",
    },
    privacy: {
        title: "Privacy Policy",
        body: "At ProEase Global, we respect your privacy and are committed to protecting the personal information you share with us.\n\nInformation we collect: When you place an order or contact us, we collect details such as your name, email, phone number, and shipping address.\n\nHow we use it: Your information is used solely to process orders, provide support, and improve your shopping experience. We do not sell your data to third parties.\n\nSecurity: We use industry-standard measures to keep your information safe.\n\nContact: For any privacy-related questions, email us at info@proeaseglobal.com.",
    },
    terms: {
        title: "Terms & Conditions",
        body: "Welcome to ProEase Global. By using our website and placing an order, you agree to the following terms.\n\nOrders: All orders are subject to availability and confirmation of the order price.\n\nPricing: Prices are listed in INR and are subject to change without notice.\n\nShipping & Returns: Please refer to our shipping and return policies. Returns are accepted within 7 days of delivery for unused items in original condition.\n\nIntellectual property: All content on this site is the property of ProEase Global and may not be used without permission.\n\nContact: For questions about these terms, email info@proeaseglobal.com.",
    },
}

const getPages = async (req, res) => {
    try {
        const pages = await pagesModel.findOne({})
        res.json({ success: true, pages: pages || defaults })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updatePages = async (req, res) => {
    try {
        // All text fields come in as a JSON string; images come as files.
        let data = {}
        try { data = JSON.parse(req.body.data || '{}') } catch { data = {} }

        const existing = await pagesModel.findOne({})
        const about = { ...(existing?.about?.toObject?.() || existing?.about || defaults.about), ...(data.about || {}) }
        const contact = { ...(existing?.contact?.toObject?.() || existing?.contact || defaults.contact), ...(data.contact || {}) }
        const privacy = { ...(existing?.privacy?.toObject?.() || existing?.privacy || defaults.privacy), ...(data.privacy || {}) }
        const terms = { ...(existing?.terms?.toObject?.() || existing?.terms || defaults.terms), ...(data.terms || {}) }

        // Optional image uploads (keep existing if no new file).
        const aboutFile = req.files?.aboutImage?.[0]
        const contactFile = req.files?.contactImage?.[0]
        if (aboutFile) {
            const r = await cloudinary.uploader.upload(aboutFile.path, { resource_type: 'image' })
            about.image = r.secure_url
        }
        if (contactFile) {
            const r = await cloudinary.uploader.upload(contactFile.path, { resource_type: 'image' })
            contact.image = r.secure_url
        }

        const pages = await pagesModel.findOneAndUpdate({}, { about, contact, privacy, terms }, { new: true, upsert: true })
        res.json({ success: true, message: "Pages Updated", pages })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getPages, updatePages }
