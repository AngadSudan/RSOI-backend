import { Router } from 'express';
import {
    createFaq,
    deleteFaq,
    getAllFaqs,
    toggleFaqStatus,
    updateFaq,
} from '../controllers/faqs.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const faqRouter = Router();

faqRouter.get('/fetch-faq', getAllFaqs);
faqRouter.post('/create-faq', verifyJWT, createFaq);
faqRouter.patch('/update-faq/:id', verifyJWT, updateFaq);
faqRouter.patch('/toggle-faq/:id', verifyJWT, toggleFaqStatus);
faqRouter.delete('/delete-faq/:id', verifyJWT, deleteFaq);

export default faqRouter;
