import User from '../models/user.models.js';
import Review from '../models/review.models';
import Event from '../models/events.models.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const addReview = async (req, res) => {
    const user = req.user._id;
    const { id } = req.params;
    const { rating, review } = req.body;
    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, 'usertoken not found, please login'));
    }
    if (!rating || rating < 1 || rating > 5) {
        return res
            .status(400)
            .json(new ApiError(400, 'Rating must be between 1 and 5'));
    }
    if (!review || review.trim().length === 0) {
        return res
            .status(400)
            .json(new ApiError(400, 'Review cannot be empty'));
    }
    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser)
            return res
                .status(404)
                .json(new ApiError(404, 'User not found in the database'));

        const event = await Event.findById(id);
        if (!event)
            return res
                .status(404)
                .json(new ApiError(404, 'Event not found in the database'));

        const dbReview = await Review.findOne({
            creator: user,
            event: event._id,
        });

        if (dbReview) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'Review already exists, you may update the previous one'
                    )
                );
        }

        const newReview = await Review.create({
            creator: user,
            event: id,
            rating,
            review,
        });

        if (!newReview)
            return res
                .status(401)
                .json(new ApiError(401, 'Review not created'));

        return res
            .status(201)
            .json(new ApiResponse(201, newReview, 'Review added successfully'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', [error.message]));
    }
};
const updateReview = async (req, res) => {
    const user = req.user._id;
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, 'usertoken not found, please login'));
    }
    if (!rating || rating < 1 || rating > 5) {
        return res
            .status(400)
            .json(new ApiError(400, 'Rating must be between 1 and 5'));
    }
    if (!review || review.trim().length === 0) {
        return res
            .status(400)
            .json(new ApiError(400, 'Review cannot be empty'));
    }
    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser)
            return res
                .status(404)
                .json(new ApiError(404, 'User not found in the database'));

        const event = await Event.findById(id);
        if (!event)
            return res
                .status(404)
                .json(new ApiError(404, 'Event not found in the database'));

        const dbReview = await Review.findOne({
            creator: user,
            event: event._id,
        });

        if (!dbReview)
            return res
                .status(404)
                .json(new ApiError(404, 'Review not found in the database'));

        const updatedReview = await Review.findByIdAndUpdate(
            dbReview._id,
            { rating, review },
            { new: true }
        );

        if (!updatedReview)
            return res
                .status(401)
                .json(new ApiError(401, 'Review not updated'));

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedReview,
                    'Review updated successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', [error.message]));
    }
};
const deleteReview = async (req, res) => {
    const user = req.user._id;
    const { id } = req.params;
    if (!user) {
        return res
            .status(401)
            .json(new ApiError(401, 'usertoken not found, please login'));
    }
    try {
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser)
            return res
                .status(404)
                .json(new ApiError(404, 'User not found in the database'));

        const dbReview = await Review.findById(id);
        if (!dbReview)
            return res
                .status(404)
                .json(new ApiError(404, 'Review not found in the database'));

        const isAdmin = dbUser.role === 'superAdmin' || 'EventAdmin';
        if (!isAdmin && dbReview.creator.toString() !== user.toString()) {
            return res
                .status(401)
                .json(
                    new ApiError(
                        401,
                        'You are not authorized to delete this review'
                    )
                );
        }

        const deletedReview = await Review.findByIdAndDelete(id);
        if (!deletedReview)
            return res
                .status(401)
                .json(new ApiError(401, 'Review not deleted'));

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    deletedReview,
                    'Review deleted successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', [error.message]));
    }
};
const getReviewByUser = async (req, res) => {
    const { id: event } = req.params;
    const user = req.user._id;
    if (!event) {
        return res.status(200).json(new ApiError(400, 'Event id is required'));
    }
    try {
        const dbEvent = await Event.findById(event);
        if (!dbEvent) {
            return res
                .status(404)
                .json(new ApiError(404, 'Event not found in the database'));
        }

        const dbUser = await User.findById(user);
        if (!dbUser) {
            return res
                .status(404)
                .json(new ApiError(404, 'User not found in the database'));
        }

        const dbReview = await Review.find({
            $and: [{ creator: user }, { event: dbEvent._id }],
        });

        if (!dbReview) {
            return res
                .status(404)
                .json(new ApiError(404, 'Review not found in the database'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, dbReview, 'Review found successfully'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', [error.message]));
    }
};
const getReviewByEvent = async (req, res) => {
    const { id: event } = req.params;

    if (!event) {
        return res.status(400).json(new ApiError(400, 'Event id is required'));
    }

    try {
        const dbEvent = await event.findById(event);
        if (!dbEvent) {
            return res
                .status(404)
                .json(new ApiError(404, 'Event not found in the database'));
        }

        const dbReview = await Review.find({ event: dbEvent._id });

        if (!dbReview) {
            return res
                .status(404)
                .json(new ApiError(404, 'Review not found in the database'));
        }

        const dbReviews = await Review.find({ event: dbEvent._id }).populate(
            'creator',
            'name email'
        );

        if (!dbReviews) {
            return res
                .status(404)
                .json(new ApiError(404, 'Review not found in the database'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, dbReviews, 'Review found successfully'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', [error.message]));
    }
};
const getEventReviewByRating = async (req, res) => {
    const { id: event } = req.params;

    if (!event) {
        return res.status(400).json(new ApiError(400, 'Event id is required'));
    }

    try {
        const dbEvent = await event.findById(event);
        if (!dbEvent) {
            return res
                .status(404)
                .json(new ApiError(404, 'Event not found in the database'));
        }

        const dbReview = await Review.find({ event: dbEvent._id });

        if (!dbReview) {
            return res
                .status(404)
                .json(new ApiError(404, 'Review not found in the database'));
        }

        const dbReviews = await Review.find({
            $and: [{ event: dbEvent._id }, { rating: { $gte: rating } }],
        }).populate('creator', 'name email');

        if (!dbReviews) {
            return res
                .status(404)
                .json(new ApiError(404, 'Review not found in the database'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, dbReviews, 'Review found successfully'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', [error.message]));
    }
};

export { addReview, updateReview, deleteReview };
//TODO: getReviewByUser, getReviewByProduct
