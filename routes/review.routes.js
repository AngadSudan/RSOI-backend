import { Router } from 'express';

const reviewRouter = Router();

import {
    updateReview,
    deleteReview,
    addReview,
    // getReviewByUser,
    // getReviewByProduct,
} from '../controllers/review.controllers.js';

reviewRouter.post('/create/:id', addReview);
reviewRouter.put('/update/:id', updateReview);
reviewRouter.delete('/delete/:id', deleteReview);

export default reviewRouter;
