import express from 'express';
import controller from '../controllers/book';
 const router = express.Router();

//route request to controller
router.get('/get/books', controller.getAllBooks)

export default router;