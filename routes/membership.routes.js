import { Router } from 'express';
import {
    createMembership,
    updateMembershipInfo,
    rejectMembership,
    generateAccessOTP,
    changeMembershipStatus,
    getMembershipInfo,
    getMembershipByStatus,
    getMembershipById,
} from '../controllers/Membership.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const membershipRouter = Router();

membershipRouter.post('/create', createMembership);
membershipRouter.patch('/update/:id', verifyJWT, updateMembershipInfo);
membershipRouter.patch('/reject/:id', verifyJWT, rejectMembership);
membershipRouter.patch('/change-status/:id', verifyJWT, changeMembershipStatus);
membershipRouter.post('/get', verifyJWT, getMembershipInfo);
membershipRouter.post('/get-by-status', verifyJWT, getMembershipByStatus);
membershipRouter.get('/get/:membership', verifyJWT, getMembershipById);
membershipRouter.post('/generate-otp', generateAccessOTP);

export default membershipRouter;
