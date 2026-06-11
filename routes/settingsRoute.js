import express from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const settingsRouter = express.Router();

settingsRouter.get('/get', getSettings);
settingsRouter.post('/update', adminAuth, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'seoImage', maxCount: 1 }]), updateSettings);

export default settingsRouter
