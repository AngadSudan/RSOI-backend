import mongoose from 'mongoose';

// {
//     userid,
//         membershipid,
//         membershipname,
//         membershipStatus,
//         feeStatus,
//         feeAmount,
//         reciptId;
// }
const membershipSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: [true, 'Please enter the user id'],
    },
    membershipname: {
        type: String,
        required: [true, 'Please enter the membership name'],
    },
    membershipStatus: {
        type: String,
        enum: ['pending', 'terminated', 'active', 'expired', 'rejected'],
        default: 'pending',
    },
    feeStatus: {
        type: String,
        required: [true, 'Please enter the fee status'],
        enum: ['paid', 'unpaid'],
        default: 'paid',
    },
    feeAmount: {
        type: Number,
        required: [true, 'Please enter the fee amount'],
    },
    reciptId: {
        type: String,
        required: [true, 'Please enter the recipt id'],
    },
});

const Membership = mongoose.model('membership', membershipSchema);

export default Membership;
