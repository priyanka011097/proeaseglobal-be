import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import categoryRouter from './routes/categoryRoute.js'
import bannerRouter from './routes/bannerRoute.js'
import offerRouter from './routes/offerRoute.js'
import trustRouter from './routes/trustRoute.js'
import footerRouter from './routes/footerRoute.js'
import settingsRouter from './routes/settingsRoute.js'
import pagesRouter from './routes/pagesRoute.js'
import faqRouter from './routes/faqRoute.js'

// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json({ limit: '10mb' }))
app.use(cors())

// api endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/category',categoryRouter)
app.use('/api/banner',bannerRouter)
app.use('/api/offer',offerRouter)
app.use('/api/trust',trustRouter)
app.use('/api/footer',footerRouter)
app.use('/api/settings',settingsRouter)
app.use('/api/pages',pagesRouter)
app.use('/api/faq',faqRouter)

app.get('/',(req,res)=>{
    res.send("API Working")
})

// On Vercel the app runs as a serverless function (exported below); elsewhere
// (local dev, Render, etc.) we start a normal listening server.
if (!process.env.VERCEL) {
    app.listen(port, ()=> console.log('Server started on PORT : '+ port))
}

export default app