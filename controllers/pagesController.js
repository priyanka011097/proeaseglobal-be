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

        const pages = await pagesModel.findOneAndUpdate({}, { about, contact }, { new: true, upsert: true })
        res.json({ success: true, message: "Pages Updated", pages })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getPages, updatePages }
