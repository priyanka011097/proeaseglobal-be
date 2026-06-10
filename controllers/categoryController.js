import categoryModel from "../models/categoryModel.js"

// function for adding a category
const addCategory = async (req, res) => {
    try {

        const { name } = req.body

        if (!name || !name.trim()) {
            return res.json({ success: false, message: "Category name is required" })
        }

        const trimmed = name.trim()

        const exists = await categoryModel.findOne({ name: trimmed })
        if (exists) {
            return res.json({ success: false, message: "Category already exists" })
        }

        const category = new categoryModel({ name: trimmed, date: Date.now() })
        await category.save()

        res.json({ success: true, message: "Category Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for listing categories
const listCategories = async (req, res) => {
    try {

        const categories = await categoryModel.find({})
        res.json({ success: true, categories })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for updating a category (e.g. toggling home-page visibility)
const updateCategory = async (req, res) => {
    try {
        const { id, showOnHome } = req.body
        const update = {}
        if (typeof showOnHome === 'boolean') update.showOnHome = showOnHome

        await categoryModel.findByIdAndUpdate(id, update)
        res.json({ success: true, message: "Category Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing a category
const removeCategory = async (req, res) => {
    try {

        await categoryModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Category Removed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addCategory, listCategories, updateCategory, removeCategory }
