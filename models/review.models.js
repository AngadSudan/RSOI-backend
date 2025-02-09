import mongoose from 'mongoose';
// {
//     writtenby,
//     event,
//     rating,
//     review,

// }
const reviewSchema = new mongoose.Schema(
    {
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator cannot be empty'],
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event cannot be empty'],
        },
        rating: {
            type: Number,
            required: [true, 'Rating cannot be empty'],
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            required: [true, 'Review cannot be empty'],
        },
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model('review', reviewSchema);

export default Review;
