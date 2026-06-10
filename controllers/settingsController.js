import { v2 as cloudinary } from "cloudinary"
import settingsModel from "../models/settingsModel.js"

const defaults = {
    logo: "",
    brandName: "PROEASEGLOBAL",
    logoPosition: "left",
    logoHeight: 56,
    logoWidth: 0,
    logoFit: "contain",
    logoPosX: 50,
    logoPosY: 50,
    announcementText: "",
    announcementActive: false,
    announcementLink: "",
    themeBg: "#FFF6F2",
    themeText: "#2B2B2B",
}

// Public: return the current site settings (or defaults).
const getSettings = async (req, res) => {
    try {
        const settings = await settingsModel.findOne({})
        res.json({ success: true, settings: settings || defaults })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const num = (v, fallback) => {
    const n = Number(v)
    return isNaN(n) ? fallback : n
}

// Admin: update branding + logo layout. Uploads a new logo when a file is
// provided; `removeLogo=true` clears it (reverting to the built-in mark).
const updateSettings = async (req, res) => {
    try {
        const existing = await settingsModel.findOne({})
        const b = req.body

        const update = {
            brandName: b.brandName ?? (existing?.brandName ?? defaults.brandName),
            logo: existing?.logo ?? "",
            logoPosition: ['left', 'center', 'right'].includes(b.logoPosition) ? b.logoPosition : (existing?.logoPosition ?? defaults.logoPosition),
            logoHeight: Math.max(20, Math.min(160, num(b.logoHeight, existing?.logoHeight ?? defaults.logoHeight))),
            logoWidth: Math.max(0, Math.min(400, num(b.logoWidth, existing?.logoWidth ?? defaults.logoWidth))),
            logoFit: ['contain', 'cover'].includes(b.logoFit) ? b.logoFit : (existing?.logoFit ?? defaults.logoFit),
            logoPosX: Math.max(0, Math.min(100, num(b.logoPosX, existing?.logoPosX ?? defaults.logoPosX))),
            logoPosY: Math.max(0, Math.min(100, num(b.logoPosY, existing?.logoPosY ?? defaults.logoPosY))),
            announcementText: b.announcementText ?? (existing?.announcementText ?? defaults.announcementText),
            announcementActive: typeof b.announcementActive === 'boolean'
                ? b.announcementActive
                : (b.announcementActive === 'true' ? true : (b.announcementActive === 'false' ? false : (existing?.announcementActive ?? defaults.announcementActive))),
            announcementLink: b.announcementLink ?? (existing?.announcementLink ?? defaults.announcementLink),
            themeBg: b.themeBg ?? (existing?.themeBg ?? defaults.themeBg),
            themeText: b.themeText ?? (existing?.themeText ?? defaults.themeText),
        }

        if (b.removeLogo === 'true') {
            update.logo = ""
        } else if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
            update.logo = result.secure_url
        }

        const settings = await settingsModel.findOneAndUpdate({}, update, { new: true, upsert: true })
        res.json({ success: true, message: "Branding Updated", settings })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { getSettings, updateSettings }
