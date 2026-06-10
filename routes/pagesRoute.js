import express from 'express'
import { getPages, updatePages } from '../controllers/pagesController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const pagesRouter = express.Router();

pagesRouter.get('/get', getPages);
pagesRouter.post('/update', adminAuth, upload.fields([{ name: 'aboutImage', maxCount: 1 }, { name: 'contactImage', maxCount: 1 }]), updatePages);

export default pagesRouter
