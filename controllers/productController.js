import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import categoryModel from "../models/categoryModel.js"

const PLACEHOLDER_IMG = "https://placehold.co/600x800?text=No+Image"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller, color, fabric } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            color: color || "",
            fabric: fabric || "",
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for bulk-adding products (e.g. from an Excel import).
// Expects { products: [...] }. Each item is mapped/validated, missing
// categories are auto-created, and rows whose SKU already exists are skipped.
const addProductsBulk = async (req, res) => {
    try {
        const incoming = Array.isArray(req.body.products) ? req.body.products : []
        if (incoming.length === 0) {
            return res.json({ success: false, message: "No products provided" })
        }

        // Existing SKUs (to skip duplicates on re-import).
        const existing = await productModel.find({ sku: { $nin: ["", null] } }, 'sku')
        const existingSkus = new Set(existing.map((p) => p.sku))

        const toInsert = []
        const skipped = []
        const categoryNames = new Set()

        for (const raw of incoming) {
            const name = (raw.name || "").toString().trim()
            const category = (raw.category || "").toString().trim()
            const price = Number(raw.price)
            const sku = (raw.sku || "").toString().trim()

            if (!name || !category || isNaN(price) || price <= 0) {
                skipped.push({ sku: sku || name, reason: "missing name/category/price" })
                continue
            }
            if (sku && existingSkus.has(sku)) {
                skipped.push({ sku, reason: "already exists" })
                continue
            }
            if (sku) existingSkus.add(sku) // guard against dupes within the same upload

            const images = Array.isArray(raw.image) ? raw.image.filter(Boolean) : []
            categoryNames.add(category)

            toInsert.push({
                name,
                description: (raw.description || name).toString(),
                price,
                category,
                subCategory: (raw.subCategory || "Topwear").toString(),
                sizes: Array.isArray(raw.sizes) && raw.sizes.length > 0 ? raw.sizes : ["Free Size"],
                image: images.length > 0 ? images : [PLACEHOLDER_IMG],
                bestseller: !!raw.bestseller,
                color: raw.color || "",
                fabric: raw.fabric || "",
                details: Array.isArray(raw.details) ? raw.details : [],
                stock: Array.isArray(raw.stock) ? raw.stock : [],
                sku,
                date: Date.now(),
            })
        }

        // Auto-create any categories that don't exist yet.
        for (const name of categoryNames) {
            await categoryModel.updateOne(
                { name },
                { $setOnInsert: { name, date: Date.now() } },
                { upsert: true }
            )
        }

        if (toInsert.length > 0) {
            await productModel.insertMany(toInsert)
        }

        res.json({
            success: true,
            message: `Imported ${toInsert.length} product(s)` + (skipped.length ? `, skipped ${skipped.length}` : ""),
            inserted: toInsert.length,
            skipped,
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true,products})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for updating an existing product
const updateProduct = async (req, res) => {
    try {

        const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body

        const existing = await productModel.findById(id)
        if (!existing) {
            return res.json({ success: false, message: "Product not found" })
        }

        // For each of the 4 image slots: upload a new file if provided, otherwise
        // keep the image that the product already had at that position.
        const imagesUrl = []
        for (let i = 1; i <= 4; i++) {
            const file = req.files[`image${i}`] && req.files[`image${i}`][0]
            const existingUrl = req.body[`existingImage${i}`]
            if (file) {
                const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' })
                imagesUrl.push(result.secure_url)
            } else if (existingUrl) {
                imagesUrl.push(existingUrl)
            }
        }

        const updatedData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl.length > 0 ? imagesUrl : existing.image
        }

        await productModel.findByIdAndUpdate(id, updatedData)

        res.json({ success: true, message: "Product Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for deleting ALL products (admin bulk action)
const removeAllProducts = async (req, res) => {
    try {
        const result = await productModel.deleteMany({})
        res.json({ success: true, message: `Deleted ${result.deletedCount} product(s)` })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProducts, addProduct, addProductsBulk, updateProduct, removeProduct, removeAllProducts, singleProduct }