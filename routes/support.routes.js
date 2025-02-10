import { Router } from 'express';
import { getSupport } from '../controllers/chatbot.controller.js';
const supportRouter = Router();

supportRouter.post('/contact', getSupport);

export default supportRouter;
