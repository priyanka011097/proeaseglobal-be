import express from 'express'
import { getOffer, updateOffer } from '../controllers/offerController.js'
import adminAuth from '../middleware/adminAuth.js';

const offerRouter = express.Router();

offerRouter.get('/get', getOffer);
offerRouter.post('/update', adminAuth, updateOffer);

export default offerRouter
