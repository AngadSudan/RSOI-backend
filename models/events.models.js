import mongoose from 'mongoose';
const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    timeline: {
        type: String,
        required: [true, 'Timeline is required'],
    },
    location: {
        type: String,
    },
    mode: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        required: [true, 'Mode is required'],
    },
    eventLink: {
        type: String,
    },
    imageLink: {
        type: String,
        required: [true, 'Image Link is required'],
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'past'],
        default: 'upcoming',
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
