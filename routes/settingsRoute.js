import express from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const settingsRouter = express.Router();

settingsRouter.get('/get', getSettings);
settingsRouter.post('/update', adminAuth, upload.single('logo'), updateSettings);

export default settingsRouter
