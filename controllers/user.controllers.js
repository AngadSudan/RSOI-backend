import { ApiError, ApiResponse } from '../utils/index.js';
import User from '../models/user.models.js';
import mongoose from 'mongoose';
const getTokens = async (user) => {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    return { accessToken, refreshToken };
};
const registerUser = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        usertype,
        address,
        country,
        role,
        isMember,
    } = req.body;

    if (!firstName) {
        return res
            .status(400)
            .json(new ApiError(400, 'First name is required'));
    }
    if (!lastName) {
        return res.status(400).json(new ApiError(400, 'Last name is required'));
    }
    if (!email) {
        return res.status(400).json(new ApiError(400, 'Email is required'));
    }
    if (!phoneNumber) {
        return res
            .status(400)
            .json(new ApiError(400, 'Phone number is required'));
    }
    if (!password) {
        return res.status(400).json(new ApiError(400, 'Password is required'));
    }
    if (!usertype) {
        return res.status(400).json(new ApiError(400, 'User type is required'));
    }
    if (!address) {
        return res.status(400).json(new ApiError(400, 'Address is required'));
    }
    if (!country) {
        return res.status(400).json(new ApiError(400, 'Country is required'));
    }

    try {
        //check for existing user
        const existingUser = await User.findOne({
            $or: [{ email: email }, { phoneNumber: phoneNumber }],
        });

        if (existingUser) {
            return res
                .status(400)
                .json(new ApiError(400, 'User already exists'));
        }
        const createdUser = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            usertype,
            address,
            country,
            role,
            isMember,
        });

        if (!createdUser) {
            return res
                .status(400)
                .json(new ApiError(400, 'User registration failed'));
        }

        return res
            .status(201)
            .json(new ApiResponse(201, 'User created', createdUser));
    } catch (error) {
        console.log(error);
        res.status(500).json(
            new ApiError(500, error.message || 'Internal server error', [
                error?.message,
            ])
        );
    }
};
const loginUser = async (req, res) => {
    const { email, phoneNumber, password } = req.body;
    if (!email && !phoneNumber) {
        return res
            .status(400)
            .json(new ApiError(400, 'Email or Phone number is required'));
    }
    if (!password) {
        return res.status(400).json(new ApiError(400, 'Password is required'));
    }

    try {
        //check if email is present
        const dbUser = await User.findOne({
            $or: [{ email: email }, { phoneNumber: phoneNumber }],
        });

        if (!dbUser) {
            return res.status(400).json(new ApiError(400, 'User not found'));
        }

        const isAuthorized = dbUser.isPasswordCorrect(password);

        if (!isAuthorized) {
            return res
                .status(400)
                .json(new ApiError(401, 'Invalid credentials'));
        }

        const { accessToken, refreshToken } = await getTokens(dbUser);
        const updatedUser = await User.findByIdAndUpdate(
            dbUser._id,
            {
                refreshToken: refreshToken,
            },
            { new: true }
        ).select('-password -refreshToken');

        if (!updatedUser) {
            return res.status(400).json(new ApiError(400, 'Login failed'));
        }

        const options = {
            httpOnly: true,
            sameSite: true,
        };

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .json(
                new ApiResponse(200, 'Login successful', {
                    accessToken,
                    user: updatedUser,
                })
            );
    } catch (error) {
        console.log(error);
        res.status(500).json(
            new ApiError(500, 'Internal server error', [error.message])
        );
    }
};

//TODO:FIX UPDATED USER
const updateUser = async (req, res) => {
    const { id: userId } = req.params;
    const updateData = req.body;

    if (!userId) {
        return res.status(400).json(new ApiError(400, 'User ID is required'));
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        });

        if (!updatedUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'User updated successfully', updatedUser)
            );
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError(500, 'Internal server error', error));
    }
};
const assignUserRole = async (req, res) => {
    const user = req.user._id;
    const { id: userId } = req.params;
    const { role } = req.body;
    if (!userId) {
        return res.status(400).json(new ApiError(400, 'User ID is required'));
    }
    if (!role) {
        return res.status(400).json(new ApiError(400, 'Role is required'));
    }
    try {
        const adminUser = await User.findById(user);
        if (!adminUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }
        if (adminUser.role !== 'superAdmin') {
            return res
                .status(403)
                .json(
                    new ApiError(403, 'only super admins can change user roles')
                );
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: role },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'User role updated successfully',
                    updatedUser
                )
            );
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError(500, 'Internal server error', error));
    }
};
const getUserByRole = async (req, res) => {
    const user = req.used._id;
    const { role } = req.body;

    if (!user) {
        return res.status(401).json(new ApiError(401, 'User not found'));
    }
    if (!role) {
        return res.status(400).json(new ApiError(400, 'Role is required'));
    }

    try {
        const dbUser = await User.findById(user);

        if (!dbUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        if (dbUser.role !== 'superAdmin') {
            return res
                .status(403)
                .json(
                    new ApiError(403, 'Only super admins can get users by role')
                );
        }

        const fetchedUsers = await User.find({
            role: {
                $in: [...role],
            },
        });

        if (!fetchedUsers) {
            return res.status(404).json(new ApiError(404, 'No users found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Users fetched successfully', fetchedUsers)
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error));
    }
};
const getUserByStatus = async (req, res) => {
    const user = req.used._id;
    const { status } = req.body;

    if (!user) {
        return res.status(401).json(new ApiError(401, 'User not found'));
    }
    if (!status) {
        return res.status(400).json(new ApiError(400, 'Status is required'));
    }

    try {
        const dbUser = await User.findById(user);

        if (!dbUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        if (dbUser.role !== 'superAdmin') {
            return res
                .status(403)
                .json(
                    new ApiError(403, 'Only super admins can get users by role')
                );
        }

        const fetchedUsers = await User.find({
            role: {
                $in: [...status],
            },
        });

        if (!fetchedUsers) {
            return res.status(404).json(new ApiError(404, 'No users found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Users fetched successfully', fetchedUsers)
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error));
    }
};
const changeUserStatus = async (req, res) => {
    const user = req.user._id;
    const { id: userId } = req.params;
    const { status } = req.body;

    if (!userId) {
        return res.status(400).json(new ApiError(400, 'User ID is required'));
    }
    if (!status) {
        return res.status(400).json(new ApiError(400, 'Status is required'));
    }

    try {
        const adminUser = await User.findById(user);
        if (!adminUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }
        if (adminUser.role !== 'superAdmin') {
            return res
                .status(403)
                .json(
                    new ApiError(
                        403,
                        'only super admins can change user status'
                    )
                );
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { status: status },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'User status updated successfully',
                    updatedUser
                )
            );
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError(500, 'Internal server error', error));
    }
};
const deleteUser = async (req, res) => {
    const user = req.user._id;
    const { id: userId } = req.params;

    if (!userId) {
        return res.status(400).json(new ApiError(400, 'User ID is required'));
    }

    try {
        const adminUser = await User.findById(user);
        if (!adminUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }
        if (adminUser.role !== 'superAdmin') {
            return res
                .status(403)
                .json(new ApiError(403, 'only super admins can delete users'));
        }

        const dbUser = await User.findByIdAndDelete(userId);
        const deletedUser = await User.findByIdAndDelete(dbUser._id);

        if (!deletedUser) {
            return res.status(404).json(new ApiError(404, 'User not found'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'User deleted successfully'));
    } catch (error) {
        console.log(error);
        res.status(500).json(new ApiError(500, 'Internal server error', error));
    }
};
export {
    registerUser,
    assignUserRole,
    loginUser,
    updateUser,
    getUserByRole,
    getUserByStatus,
    changeUserStatus,
    deleteUser,
};
