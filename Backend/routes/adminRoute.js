import express from 'express'
import { addDoctor,loginAdmin } from '../controllers/adminController.js'
import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js';

const adminRouter=express.Router();
// only admin will be able to add doctor, so this middleware first check if the user is admin by using authAdmin middleware if yes then it procced to adding doctor

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin)
export default adminRouter