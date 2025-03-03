import mongoose, { Schema } from 'mongoose';

const announcementSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
});
const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
