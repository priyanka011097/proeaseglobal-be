import mongoose from "mongoose";

const pointSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    text: { type: String, default: "" },
}, { _id: false })

// Editable content for the About and Contact pages. Single document.
const pagesSchema = new mongoose.Schema({
    about: {
        image: { type: String, default: "" },
        text1: { type: String, default: "" },
        text2: { type: String, default: "" },
        missionTitle: { type: String, default: "Our Mission" },
        missionText: { type: String, default: "" },
        visionTitle: { type: String, default: "Our Vision" },
        visionText: { type: String, default: "" },
        points: { type: [pointSchema], default: [] },
    },
    contact: {
        image: { type: String, default: "" },
        storeTitle: { type: String, default: "Our Store" },
        address: { type: String, default: "" },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
        careersTitle: { type: String, default: "Careers" },
        careersText: { type: String, default: "" },
    },
})

const pagesModel = mongoose.models.pages || mongoose.model("pages", pagesSchema);

export default pagesModel
