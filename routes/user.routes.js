import { Router } from 'express';

import {
    registerUser,
    loginUser,
    updateUser,
    assignUserRole,
} from '../controllers/user.controllers.js';

const userRouter = Router();

userRouter.post('/create', registerUser);
userRouter.post('/login', loginUser);
userRouter.put('/update/:id', updateUser);
userRouter.put('/assign-role/:id', assignUserRole);

export default userRouter;
