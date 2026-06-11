import express from 'express'
import { addCategory, listCategories, updateCategory, removeCategory, removeAllCategories } from '../controllers/categoryController.js'
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

categoryRouter.post('/add', adminAuth, addCategory);
categoryRouter.post('/update', adminAuth, updateCategory);
categoryRouter.post('/remove', adminAuth, removeCategory);
categoryRouter.post('/removeall', adminAuth, removeAllCategories);
categoryRouter.get('/list', listCategories);

export default categoryRouter
