import offerModel from "../models/offerModel.js"

// Default content used when no offer document has been saved yet.
const defaults = {
    prefix: "GET UPTO",
    highlight: "15%",
    suffix: "CASH BACK",
    subText: "ON SELECT PAYMENT METHODS",
    rightTitle: "Wallet Offers",
    rightText: "On Orders Above ₹2999",
    active: true,
}

// Public: return the current offer banner content (or defaults).
const getOffer = async (req, res) => {
    try {
        const offer = await offerModel.findOne({})
        res.json({ success: true, offer: offer || defaults })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: create or update the single offer banner document.
const updateOffer = async (req, res) => {
    try {
        const { prefix, highlight, suffix, subText, rightTitle, rightText, active } = req.body

        const update = {
            prefix: prefix ?? defaults.prefix,
            highlight: highlight ?? defaults.highlight,
            suffix: suffix ?? defaults.suffix,
            subText: subText ?? defaults.subText,
            rightTitle: rightTitle ?? defaults.rightTitle,
            rightText: rightText ?? defaults.rightText,
            active: typeof active === 'boolean' ? active : true,
        }

        const offer = await offerModel.findOneAndUpdate({}, update, { new: true, upsert: true })
        res.json({ success: true, message: "Offer Banner Updated", offer })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getOffer, updateOffer }
