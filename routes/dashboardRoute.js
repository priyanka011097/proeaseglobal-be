import express from 'express'
import { getStats } from '../controllers/dashboardController.js'
import adminAuth from '../middleware/adminAuth.js'

const dashboardRouter = express.Router()

dashboardRouter.get('/stats', adminAuth, getStats)

export default dashboardRouter
