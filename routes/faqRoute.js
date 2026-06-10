import express from 'express'
import { getFaq, updateFaq } from '../controllers/faqController.js'
import adminAuth from '../middleware/adminAuth.js';

const faqRouter = express.Router();

faqRouter.get('/get', getFaq);
faqRouter.post('/update', adminAuth, updateFaq);

export default faqRouter
