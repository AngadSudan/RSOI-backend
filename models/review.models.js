import mongoose from 'mongoose';
// {
//     writtenby,
//     event,
//     rating,
//     review,

// }
const reviewSchema = new mongoose.Schema(
    {
        writtenby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model('review', reviewSchema);

export default Review;
