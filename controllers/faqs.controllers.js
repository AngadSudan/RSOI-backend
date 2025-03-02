import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Faq from '../models/faqs.models.js';
import User from '../models/user.models.js';
import mongoose from 'mongoose';
const createFaq = async (req, res) => {
    const user = req.user._id;
    const { question, answer, status } = req.body;
    if (!user) {
        throw new Error('missing refresh and access tokens');
    }
    if (!question) {
        throw new Error('question is required to post an faq');
    }
    if (!answer) {
        throw new Error('answer is required to post an faq');
    }

    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!user) {
            throw new Error('no such user in the database');
        }

        if (dbUser.role === 'membershipAdmin') {
            throw new Error('you are unAuthorized to access the FAQ section');
        }

        const createdFaq = await Faq.create({
            creator: dbUser._id,
            question,
            answer,
            status: status || 'active',
        });

        if (!createdFaq) {
            throw new Error("faq couldn't be created");
        }

        const precievedFAQ = await Faq.findById(createdFaq._id);
        if (!precievedFAQ) {
            throw new Error('could not fetch the faq after creation');
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    precievedFAQ,
                    'faqs has been created succesfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(
                    500,
                    error.message ||
                        'Internal server error while creating the FAQ'
                )
            );
    }
};
const updateFaq = async (req, res) => {
    const user = req.user._id;
    const { question, answer } = req.body;
    const { id } = req.params;
    if (!user) {
        throw new Error("user token couldn't be found please login again");
    }

    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!user) {
            throw new Error('user not found in the database');
        }

        if (dbUser.role === 'membershipAdmin') {
            throw new Error("you are not allowed to update any FAQ's");
        }

        const dbFaq = await Faq.findById(id);
        if (!dbFaq) {
            throw new Error('trying to update a non-existing FAQ');
        }

        const updatedfaq = await Faq.findByIdAndUpdate(
            dbFaq._id,
            {
                question: question || dbFaq.question,
                answer: answer || dbFaq.answer,
            },
            {
                new: true,
            }
        );
        if (!updatedfaq) {
            throw new Error('faq updation failed');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, updatedfaq, 'faq updated successfully'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(
                    500,
                    'internal server error occured in updating the faq',
                    [error.message]
                )
            );
    }
};
const getAllFaqs = async (req, res) => {
    try {
        const fetchedFaq = await Faq.find();
        if (!fetchedFaq) {
            return res
                .status(401)
                .json(new ApiError(401, 'could not fetch the faqs'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, fetchedFaq, 'FAQ fetched successfully'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'couldnot fetch the faqs', [error.message])
            );
    }
};
const getFaqById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json(new ApiError(400, 'missing id'));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const fetchedFaq = await Faq.findById(id).session(session);
        if (!fetchedFaq) {
            await session.abortTransaction();
            session.endSession();
            return res
                .status(401)
                .json(new ApiError(401, 'could not fetch the faq'));
        }

        await session.commitTransaction();
        session.endSession();
        return res
            .status(200)
            .json(new ApiResponse(200, fetchedFaq, 'FAQ fetched successfully'));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'error in fetching the faq', [error.message])
            );
    }
};
const toggleFaqStatus = async (req, res) => {
    const user = req.user._id;
    const { id } = req.params;
    if (!user) {
        throw new Error("user token couldn't be found please login again");
    }
    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!user) {
            throw new Error('user could not be found in the database');
        }

        if (dbUser.role === 'membershipAdmin') {
            throw new Error("you are not allowed to toggle the FAQ's status");
        }

        const dbFaq = await Faq.findById(id);
        if (!dbFaq) {
            throw new Error("no such FAQ's found in the database");
        }

        const toggleFaq = await Faq.findByIdAndUpdate(
            dbFaq._id,
            {
                status: dbFaq.status === 'active' ? 'inactive' : 'active',
            },
            { new: true }
        );

        if (!toggleFaq)
            throw new Error("faq's status couldn't be toggled in the database");

        return res
            .status(200)
            .json(new ApiResponse(200, toggleFaq, 'FAQ toggled'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'error in switching the status', [
                    error.message,
                ])
            );
    }
};
const deleteFaq = async (req, res) => {
    const user = req.user._id;
    const { id } = req.params;
    if (!user) {
        throw new Error("user token couldn't be found please login again");
    }
    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!user) {
            throw new Error("user couldn't be found in the database");
        }

        if (dbUser.role === 'membershipAdmin') {
            throw new Error("you are not allowed to delete the FAQ's");
        }

        const deletedFaq = await Faq.findByIdAndDelete(id);

        return res
            .status(200)
            .json(new ApiResponse(200, deletedFaq, 'FAQ deleted'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'error in switching the status', [
                    error.message,
                ])
            );
    }
};

export { createFaq, updateFaq, getAllFaqs, toggleFaqStatus, deleteFaq };
