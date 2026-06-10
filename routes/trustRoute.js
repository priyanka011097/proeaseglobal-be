import express from 'express'
import { getTrust, updateTrust } from '../controllers/trustController.js'
import adminAuth from '../middleware/adminAuth.js';

const trustRouter = express.Router();

trustRouter.get('/get', getTrust);
trustRouter.post('/update', adminAuth, updateTrust);

export default trustRouter
