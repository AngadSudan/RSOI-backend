import mongoose from 'mongoose';
const faqSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required'],
    },
    question: {
        type: String,
        required: [true, 'Question is required'],
    },
    answer: {
        type: String,
        required: [true, 'Answer is required'],
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive'],
    },
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
