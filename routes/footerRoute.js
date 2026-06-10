import express from 'express'
import { getFooter, updateFooter } from '../controllers/footerController.js'
import adminAuth from '../middleware/adminAuth.js';

const footerRouter = express.Router();

footerRouter.get('/get', getFooter);
footerRouter.post('/update', adminAuth, updateFooter);

export default footerRouter
