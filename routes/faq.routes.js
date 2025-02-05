import { Router } from 'express';

const faqRouter = Router();

faqRouter.get('/fetch-faq');
faqRouter.post('/create-faq');
faqRouter.patch('/update-faq/:id');
faqRouter.patch('/toggle-faq/:id');
faqRouter.delete('/delete-faq/:id');

export default faqRouter;
