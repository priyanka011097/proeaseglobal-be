import { v2 as cloudinary } from "cloudinary"
import bannerModel from "../models/bannerModel.js"

const MAX_BANNERS = 5

// function for adding a banner slide
const addBanner = async (req, res) => {
    try {

        const { heading, subText, offer, link } = req.body

        // Enforce the 5-slide cap.
        const count = await bannerModel.countDocuments({})
        if (count >= MAX_BANNERS) {
            return res.json({ success: false, message: `You can have at most ${MAX_BANNERS} banner slides. Remove one first.` })
        }

        const desktopFile = req.files?.desktopImage?.[0]
        const mobileFile = req.files?.mobileImage?.[0]

        if (!desktopFile) {
            return res.json({ success: false, message: "Desktop banner image is required" })
        }

        const desktopUpload = await cloudinary.uploader.upload(desktopFile.path, { resource_type: 'image' })
        const mobileUpload = mobileFile
            ? await cloudinary.uploader.upload(mobileFile.path, { resource_type: 'image' })
            : null

        const banner = new bannerModel({
            desktopImage: desktopUpload.secure_url,
            mobileImage: mobileUpload ? mobileUpload.secure_url : "",
            heading: heading || "",
            subText: subText || "",
            offer: offer || "",
            link: link || "",
            date: Date.now()
        })
        await banner.save()

        res.json({ success: true, message: "Banner Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for listing banners
const listBanners = async (req, res) => {
    try {

        const banners = await bannerModel.find({}).sort({ date: 1 })
        res.json({ success: true, banners })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for editing an existing banner slide
const updateBanner = async (req, res) => {
    try {
        const { id, heading, subText, offer, link } = req.body

        const banner = await bannerModel.findById(id)
        if (!banner) {
            return res.json({ success: false, message: "Banner not found" })
        }

        const desktopFile = req.files?.desktopImage?.[0]
        const mobileFile = req.files?.mobileImage?.[0]

        if (desktopFile) {
            const upload = await cloudinary.uploader.upload(desktopFile.path, { resource_type: 'image' })
            banner.desktopImage = upload.secure_url
        }
        if (mobileFile) {
            const upload = await cloudinary.uploader.upload(mobileFile.path, { resource_type: 'image' })
            banner.mobileImage = upload.secure_url
        }

        if (heading !== undefined) banner.heading = heading
        if (subText !== undefined) banner.subText = subText
        if (offer !== undefined) banner.offer = offer
        if (link !== undefined) banner.link = link

        await banner.save()
        res.json({ success: true, message: "Banner Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing a banner
const removeBanner = async (req, res) => {
    try {

        await bannerModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Banner Removed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addBanner, listBanners, updateBanner, removeBanner }
