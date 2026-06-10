import express from 'express'
import { addBanner, listBanners, updateBanner, removeBanner } from '../controllers/bannerController.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const bannerRouter = express.Router();

const bannerUpload = upload.fields([{ name: 'desktopImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }])

bannerRouter.post('/add', adminAuth, bannerUpload, addBanner);
bannerRouter.post('/update', adminAuth, bannerUpload, updateBanner);
bannerRouter.post('/remove', adminAuth, removeBanner);
bannerRouter.get('/list', listBanners);

export default bannerRouter
