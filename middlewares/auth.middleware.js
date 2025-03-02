import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import { ApiError } from '../utils/index.js';

const verifyJWT = async (req, res, next) => {
    const token =
        req.cookies.accessToken ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res
            .status(401)
            .json(
                new ApiError(401, 'user is missing tokens, please login again')
            );
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken?.id).select(
        '-password -refreshToken'
    );
    if (!user)
        return res
            .status(401)
            .json(new ApiError(401, 'couldnot fetch the user from the token'));

    req.user = user;
    console.log(user);
    next();
};

export { verifyJWT };
