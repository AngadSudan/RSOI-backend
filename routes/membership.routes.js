import { Router } from 'express';
import {
    createMembership,
    updateMembershipInfo,
    rejectMembership,
    generateAccessOTP,
    changeMembershipStatus,
    getMembershipInfo,
} from '../controllers/Membership.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const membershipRouter = Router();

membershipRouter.post('/create', createMembership);
membershipRouter.patch('/update/:id', verifyJWT, updateMembershipInfo);
membershipRouter.patch('/reject/:id', verifyJWT, rejectMembership);
membershipRouter.patch('/change-status/:id', verifyJWT, changeMembershipStatus);
membershipRouter.get('/get/:id', verifyJWT, getMembershipInfo);
membershipRouter.get('/generate-otp', generateAccessOTP);

export default membershipRouter;
