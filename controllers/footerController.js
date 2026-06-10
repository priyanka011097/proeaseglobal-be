import footerModel from "../models/footerModel.js"

// Default content used when no footer document has been saved yet.
const defaults = {
    brandName: "PROEASE GLOBAL",
    features: [
        { icon: "truck", heading: "Hassle-Free Delivery" },
        { icon: "globe", heading: "Ships Worldwide" },
        { icon: "shield", heading: "100% Money Back Guarantee" },
    ],
    description: "Quality products, handcrafted with care. Bringing premium materials to your home and business.",
    quickLinksTitle: "Quick Links",
    quickLinks: [
        { label: "Track Order", url: "/orders" },
        { label: "Help Desk", url: "/contact" },
        { label: "Contact Us", url: "/contact" },
        { label: "Privacy", url: "/" },
        { label: "FAQ", url: "/contact" },
        { label: "About Us", url: "/about" },
        { label: "Terms", url: "/" },
    ],
    contactTitle: "Get in Touch",
    email: "info@proeaseglobal.com",
    phone: "+91 91369 61528",
    hours: "Mon – Sat, 10am – 7pm",
    copyright: "© 2026 Proease Global. All rights reserved.",
    tagline: "Made with care.",
}

// Public: return the current footer content (or defaults).
const getFooter = async (req, res) => {
    try {
        const footer = await footerModel.findOne({})
        res.json({ success: true, footer: footer || defaults })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: create or update the single footer document.
const updateFooter = async (req, res) => {
    try {
        const b = req.body

        // Keep only valid {label, url} pairs that have a label.
        const quickLinks = Array.isArray(b.quickLinks)
            ? b.quickLinks
                .filter((l) => l && typeof l.label === 'string' && l.label.trim() !== '')
                .map((l) => ({ label: l.label, url: l.url || '/' }))
            : defaults.quickLinks

        // Keep valid {icon, heading} feature items.
        const features = Array.isArray(b.features)
            ? b.features
                .filter((f) => f && typeof f.heading === 'string' && f.heading.trim() !== '')
                .map((f) => ({ icon: f.icon || 'truck', heading: f.heading }))
            : defaults.features

        const update = {
            brandName: b.brandName ?? defaults.brandName,
            features,
            description: b.description ?? defaults.description,
            quickLinksTitle: b.quickLinksTitle ?? defaults.quickLinksTitle,
            quickLinks,
            contactTitle: b.contactTitle ?? defaults.contactTitle,
            email: b.email ?? defaults.email,
            phone: b.phone ?? defaults.phone,
            hours: b.hours ?? defaults.hours,
            copyright: b.copyright ?? defaults.copyright,
            tagline: b.tagline ?? defaults.tagline,
        }

        const footer = await footerModel.findOneAndUpdate({}, update, { new: true, upsert: true })
        res.json({ success: true, message: "Footer Updated", footer })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getFooter, updateFooter }
