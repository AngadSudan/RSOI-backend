import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import { ApiError } from '../utils/index.js';

const verifyJWT = async (req, res, next) => {
    try {
        // const token =
        //     req.cookies.accessToken ||
        //     req.header('Authorization')?.replace('Bearer ', '');

        // if (!token) {
        //     throw new Error('jwt token not found, kindly relogin');
        // }
        // const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // const user = await User.findById(decodedToken?.id).select(
        //     '-password -refreshToken'
        // );
        // if (!user) throw new Error('couldnot fetch the user from the token');

        req.user = { _id: '67c4718c081b7b201c2bbadd' };
        next();
    } catch (error) {
        console.log(error);
        return res
            .status(401)
            .json(new ApiError(401, 'usertoken is not present'));
    }
};

export { verifyJWT };
