import promoModel from "../models/promoModel.js"

// Admin: list all promo codes.
const listPromos = async (req, res) => {
    try {
        const promos = await promoModel.find({}).sort({ date: -1 })
        res.json({ success: true, promos })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: create a promo code.
const addPromo = async (req, res) => {
    try {
        const { code, type, value, minOrder, expiresAt, usageLimit, active } = req.body
        const clean = (code || '').toString().trim().toUpperCase()
        if (!clean) return res.json({ success: false, message: 'Code is required' })
        if (!(Number(value) > 0)) return res.json({ success: false, message: 'Value must be greater than 0' })

        const exists = await promoModel.findOne({ code: clean })
        if (exists) return res.json({ success: false, message: 'That code already exists' })

        const promo = await promoModel.create({
            code: clean,
            type: type === 'flat' ? 'flat' : 'percent',
            value: Number(value),
            minOrder: Number(minOrder) || 0,
            expiresAt: Number(expiresAt) || 0,
            usageLimit: Number(usageLimit) || 0,
            active: active !== false,
        })
        res.json({ success: true, message: 'Promo code added', promo })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: toggle active / delete.
const togglePromo = async (req, res) => {
    try {
        const { id, active } = req.body
        await promoModel.findByIdAndUpdate(id, { active: !!active })
        res.json({ success: true, message: 'Updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const removePromo = async (req, res) => {
    try {
        await promoModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: 'Promo code removed' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Public: validate a code against an order subtotal (in INR).
// Returns { type, value, code } so the storefront can compute the discount.
const validatePromo = async (req, res) => {
    try {
        const { code, subtotalInr } = req.body
        const clean = (code || '').toString().trim().toUpperCase()
        if (!clean) return res.json({ success: false, message: 'Enter a code' })

        const promo = await promoModel.findOne({ code: clean })
        if (!promo || !promo.active) return res.json({ success: false, message: 'Invalid or inactive code' })
        if (promo.expiresAt && Date.now() > promo.expiresAt) return res.json({ success: false, message: 'This code has expired' })
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return res.json({ success: false, message: 'This code has reached its usage limit' })

        const sub = Number(subtotalInr) || 0
        if (promo.minOrder && sub < promo.minOrder) {
            return res.json({ success: false, message: `Minimum order of ₹${promo.minOrder} required for this code` })
        }

        res.json({ success: true, code: promo.code, type: promo.type, value: promo.value })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listPromos, addPromo, togglePromo, removePromo, validatePromo }
