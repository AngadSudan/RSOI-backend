import { Router } from 'express';

const reviewRouter = Router();

import {
    createReview,
    updateReview,
    deleteReview,
    // getReviewByUser,
    // getReviewByProduct,
} from '../controllers/review.controllers.js';

reviewRouter.post('/create/:id', createReview);
reviewRouter.put('/update/:id', updateReview);
reviewRouter.delete('/delete/:id', deleteReview);

export default reviewRouter;
