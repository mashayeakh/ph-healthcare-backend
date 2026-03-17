import { checkAuth } from '@/app/middleware/checkAuth';
import { Role } from '@prisma/prisma/enums';
import express from 'express';
import { ReviewController } from './review.controller';
import { validateReq } from '@/app/middleware/validateReq';
import { ReviewValidation } from './review.validation';


const router = express.Router();

router.get('/', ReviewController.getAllReviews);

router.post(
    '/',
    checkAuth(Role.PATIENT),
    validateReq(ReviewValidation.createReviewZodSchema),
    ReviewController.giveReview
);

router.get('/my-reviews', checkAuth(Role.PATIENT, Role.DOCTOR), ReviewController.getAllReviews);

router.patch('/:id', checkAuth(Role.PATIENT), validateReq(ReviewValidation.updateReviewZodSchema), ReviewController.updateReview);

router.delete('/:id', checkAuth(Role.PATIENT), ReviewController.deleteReview);




export const ReviewRoutes = router;