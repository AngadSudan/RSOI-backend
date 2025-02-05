import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Faq from '../models/faqs.models.js';
import User from '../models/user.models.js';
const createFaq = async (req, res) => {
    const user = req.user._id;
    const { question, answer, status } = req.body;
    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, 'user token not found please login'));
    }
    if (!question) {
        return res.status(400).json(new ApiError(400, 'missing question'));
    }
    if (!answer) {
        return res.status(400).json(new ApiError(400, 'missing answer'));
    }
    if (!status) {
        status = 'active';
    }
    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!user) {
            return res
                .status(404)
                .json(new ApiError(404, 'user not found in database'));
        }

        if (dbUser.role !== 'superAdmin' || dbUser.role !== 'eventAdmin') {
            return res
                .status(403)
                .json(new ApiError(403, 'You are not allowed to create FAQ'));
        }

        const createdFaq = await Faq.create({
            creator: dbUser._id,
            question,
            answer,
            status,
        });

        if (!createdFaq) {
            return res
                .status(500)
                .json(new ApiError(500, 'user cannot be created'));
        }

        const precievedFAQ = await Faq.findById(createdFaq._id);
        if (!precievedFAQ) {
            return res
                .status(500)
                .json(new ApiError(500, 'faq is not saved in the database'));
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    500,
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
        return res
            .status(401)
            .json(new ApiError(401, 'user token has not been found'));
    }

    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!user) {
            return res
                .status(404)
                .json(new ApiError(404, 'user not found in database'));
        }

        if (dbUser.role !== 'superAdmin' || dbUser.role !== 'eventAdmin') {
            return res
                .status(403)
                .json(new ApiError(403, 'You are not allowed to update FAQ'));
        }

        const dbFaq = await Faq.findById(id);
        if (!dbFaq) {
            return res
                .status(401)
                .json(
                    new ApiError(
                        401,
                        'faq couldnot be loaded, wrong id entered'
                    )
                );
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
            return res
                .status(401)
                .json(
                    new ApiError(
                        401,
                        'faqs updation failed please try again later'
                    )
                );
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
const toggleFaqStatus = async (req, res) => {
    const user = req.user._id;
    const { id } = req.params;
    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, 'user token not found please login'));
    }
    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!user) {
            return res
                .status(404)
                .json(new ApiError(404, 'user not found in database'));
        }

        if (dbUser.role !== 'superAdmin' || dbUser.role !== 'eventAdmin') {
            return res
                .status(403)
                .json(new ApiError(403, 'You are not allowed to create FAQ'));
        }

        const dbFaq = await Faq.findById(faqid);
        if (!dbFaq) {
            return res
                .status(400)
                .json(new ApiError(401, 'faq not found in the database'));
        }

        const toggleFaq = await Faq.findByIdAndUpdate(
            dbFaq._id,
            {
                status: dbFaq.status === 'active' ? 'inactive' : 'active',
            },
            { new: true }
        );

        if (!toggleFaq)
            return res
                .status(401)
                .json(
                    new ApiResponse(
                        401,
                        'status couldnot be updated try again later'
                    )
                );

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
        return res
            .status(401)
            .json(new ApiError(401, 'user token not found please login'));
    }
    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!user) {
            return res
                .status(404)
                .json(new ApiError(404, 'user not found in database'));
        }

        if (dbUser.role !== 'superAdmin' || dbUser.role !== 'eventAdmin') {
            return res
                .status(403)
                .json(new ApiError(403, 'You are not allowed to create FAQ'));
        }

        const deletedFaq = await Faq.findByIdAndDelete(faqid);

        return res
            .status(200)
            .json(new ApiResponse(200, deletedFaq, 'FAQ toggled'));
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
