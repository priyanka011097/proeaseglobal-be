import trustModel from "../models/trustModel.js"

// Default content used when no trust document has been saved yet.
const defaults = {
    items: [
        { icon: "truck", text: "Worldwide Shipping" },
        { icon: "shield", text: "Quality Product" },
        { icon: "refresh", text: "Easy Returns" },
    ],
    active: true,
}

// Public: return the current trust-badges content (or defaults).
const getTrust = async (req, res) => {
    try {
        const trust = await trustModel.findOne({})
        if (!trust) return res.json({ success: true, trust: defaults })
        // Backfill defaults for docs saved before the items field existed.
        const obj = trust.toObject()
        if (!obj.items || obj.items.length === 0) obj.items = defaults.items
        res.json({ success: true, trust: obj })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: create or update the single trust-badges document.
const updateTrust = async (req, res) => {
    try {
        const items = Array.isArray(req.body.items)
            ? req.body.items
                .filter((it) => it && typeof it.text === 'string' && it.text.trim() !== '')
                .map((it) => ({ icon: it.icon || 'truck', text: it.text }))
            : defaults.items

        const update = {
            items,
            active: typeof req.body.active === 'boolean' ? req.body.active : true,
        }

        const trust = await trustModel.findOneAndUpdate({}, update, { new: true, upsert: true })
        res.json({ success: true, message: "Trust Badges Updated", trust })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getTrust, updateTrust }
