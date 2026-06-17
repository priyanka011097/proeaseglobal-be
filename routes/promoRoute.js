import express from 'express'
import { listPromos, addPromo, togglePromo, removePromo, validatePromo } from '../controllers/promoController.js'
import adminAuth from '../middleware/adminAuth.js'

const promoRouter = express.Router()

promoRouter.post('/validate', validatePromo)            // public (storefront)
promoRouter.get('/list', adminAuth, listPromos)         // admin
promoRouter.post('/add', adminAuth, addPromo)
promoRouter.post('/toggle', adminAuth, togglePromo)
promoRouter.post('/remove', adminAuth, removePromo)

export default promoRouter
