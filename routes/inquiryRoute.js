import express from 'express'
import { addInquiry, listInquiries, removeInquiry } from '../controllers/inquiryController.js'
import adminAuth from '../middleware/adminAuth.js';

const inquiryRouter = express.Router();

inquiryRouter.post('/add', addInquiry);
inquiryRouter.get('/list', adminAuth, listInquiries);
inquiryRouter.post('/remove', adminAuth, removeInquiry);

export default inquiryRouter
