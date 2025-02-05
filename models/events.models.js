import mongoose from 'mongoose';
// {
//     name,
//     description,
//     timeline,
//     location,
//     mode,
//     eventLink,
//     imageLink
// }
const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    timeline: {
        type: Date,
        required: [true, 'Timeline is required'],
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
    },
    mode: {
        type: String,
        required: [true, 'Mode is required'],
    },
    eventLink: {
        type: String,
        required: [true, 'Event Link is required'],
    },
    imageLink: {
        type: String,
        required: [true, 'Image Link is required'],
    },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
