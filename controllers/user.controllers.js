import { ApiError, ApiResponse } from '../utils/index.js';
import User from '../models/user.models.js';
import mongoose from 'mongoose';
const getTokens = async (user) => {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    return { accessToken, refreshToken };
};
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name) throw new Error('Name is required');
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    if (!role) throw new Error('Role is required');

    try {
        //check for existing user
        const existingUser = await User.findOne({
            email,
        });

        if (existingUser) {
            return res
                .status(400)
                .json(new ApiError(400, 'User already exists'));
        }
        let createdUser = await User.create({
            name,
            email,
            password,
            role,
        });

        if (!createdUser) {
            throw new Error('User not created');
        }
        createdUser = await User.findById(createdUser._id).select(
            '-password -refreshToken'
        );
        return res
            .status(201)
            .json(
                new ApiResponse(201, createdUser, 'user created Successfully')
            );
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
    const { email, password } = req.body;
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
        //check if email is present
        const dbUser = await User.findOne({
            email,
        });

        if (!dbUser) {
            throw new Error("User doesn't exist");
        }

        const isAuthorized = dbUser.isPasswordCorrect(password);

        if (!isAuthorized) {
            throw new Error('Invalid credentials');
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
            throw new Error("couldn't update the register token in db");
        }

        const options = {
            httpOnly: true,
            sameSite: true,
        };

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        user: updatedUser,
                    },
                    'login successful'
                )
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
    const user = req.user._id; // fixed typo
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
    const user = req.user._id; // fixed typo
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
                    new ApiError(
                        403,
                        'Only super admins can get users by status'
                    )
                );
        }

        const fetchedUsers = await User.find({
            status: {
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
