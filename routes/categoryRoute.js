import express from 'express'
import { addCategory, listCategories, updateCategory, removeCategory } from '../controllers/categoryController.js'
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

categoryRouter.post('/add', adminAuth, addCategory);
categoryRouter.post('/update', adminAuth, updateCategory);
categoryRouter.post('/remove', adminAuth, removeCategory);
categoryRouter.get('/list', listCategories);

export default categoryRouter
