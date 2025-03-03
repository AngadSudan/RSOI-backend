import Announcement from '../models/announcements.models.js';
import { ApiError, ApiResponse } from '../utils/index.js';
import User from '../models/user.models.js';

const createAnnouncement = async (req, res) => {
    const user = req.user._id;
    const { title, description, date } = req.body;
    try {
        if (!title) {
            throw new Error('Title is required');
        }
        if (!date) {
            throw new Error('Date is required');
        }

        const dbUser = await User.findById(user);
        if (!dbUser) {
            throw new Error('dbUser is not found');
        }
        const role = dbUser.role;
        if (!role.includes('Admin')) {
            throw new Error('User is not authorized to create announcement');
        }

        const dbAnnounments = await Announcement.findOne({ title });
        if (dbAnnounments) {
            throw new Error('Announcement with this title already exists');
        }

        const createdAnnouncement = await Announcement.create({
            createdBy: user,
            title,
            description,
            date,
        });

        if (!createdAnnouncement) {
            throw new Error('Announcement is not created');
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    createdAnnouncement,
                    'Announcement is created successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, error.message || 'Internal Server Error'));
    }
};
const getAnnouncements = async (req, res) => {
    try {
        const dbAnnounments = await Announcement.find({}).limit(6);
        if (!dbAnnounments) {
            throw new Error('Announcements not found');
        }

        if (dbAnnounments.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, [], 'No Announcements are found'));
        } else {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        dbAnnounments,
                        'Announcements are fetched successfully'
                    )
                );
        }
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, error.message || 'Internal Server Error'));
    }
};
const updateAnnouncement = async (req, res) => {
    const { id: announcement } = req.params;
    const user = req.user._id;
    const { title, description, date } = req.body;
    try {
        const dbUser = await User.findById(user);
        if (!dbUser) {
            throw new Error('User is not found');
        }

        const role = dbUser.role;
        if (!role.includes('Admin')) {
            throw new Error('User is not authorized to update announcement');
        }

        const dbAnnounments = await Announcement.findById(announcement);
        if (!dbAnnounments) throw new Error('Announcement is not found');

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            dbAnnounments._id,
            {
                title: title || dbAnnounments.title,
                description: description || dbAnnounments.description,
                date: date || dbAnnounments.date,
            },
            {
                new: true,
            }
        );

        if (!updatedAnnouncement) {
            throw new Error('Announcement is not updated');
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedAnnouncement,
                    'Announcement is updated successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, error.message || 'Internal Server Error'));
    }
};
const deleteAnnouncement = async (req, res) => {
    const user = req.user._id;
    const { id: announcement } = req.params;
    try {
        if (!user) {
            throw new Error('user token not found, kindly relogin');
        }
        const dbUser = await User.findById(user);
        if (!dbUser) {
            throw new Error('User is not found');
        }
        const role = dbUser.role;
        if (!role.includes('Admin')) {
            throw new Error('User is not authorized to delete announcement');
        }

        const dbAnnouncement = await Announcement.findById(announcement);
        if (!dbAnnouncement) {
            throw new Error('Announcement is not found');
        }

        const deletedAnnouncement = await Announcement.findByIdAndDelete(
            dbAnnouncement._id
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    deletedAnnouncement,
                    'Announcement is deleted successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, error.message || 'Internal Server Error'));
    }
};

export {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
};
