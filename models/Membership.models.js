// const globalData = {
//     personal: {
//         firstName: '',
//         lastName: '',
//         DOB: '',
//         Nationality: '',
//         panCardNumber: '',
//         address: '',
//         pincode: '',
//         phone: '',
//         email: '',
//     },
//     organizational: {
//         designation: '',
//         organization: '',
//         highestQualification: '',
//         officeAddress: '',
//         mainFieldsOfInterest: [],
//         pinCode: '',
//     },
//     membershipType: {
//         basePrice: 50000,
//         gst: 9000,
//         name: 'Corporate',
//         requirements: '',
//         totalPrice: 59000,
//         validity: 'For 5 years for 5 representatives',
//     },
//     currentState: 0,
//     status: 'pending', //  [incomplete, pending, approved, payment, member]
//     isSuccessFul: false,
//     reasonForRejection: '',
// };

import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
    personal: {
        firstName: {
            type: String,
            required: true,
        },
        lastName: String,
        DOB: {
            type: Date,
            required: true,
        },
        Nationality: {
            type: String,
            required: true,
        },
        panCardNumber: {
            type: String,
            required: true,
            unique: true,
        },
        address: String,
        pincode: String,
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
    },
    organizational: {
        designation: String,
        organization: String,
        highestQualification: String,
        officeAddress: String,
        mainFieldsOfInterest: [String],
        pinCode: String,
    },
    membershipType: {
        basePrice: Number,
        gst: Number,
        name: {
            type: String,
            enum: [
                'Corporate',
                'Individual',
                'Student (B.Tech/B.Sc/Diploma)',
                'Student (M.Tech/MS/PhD)',
                'Student to Individual',
            ],
            required: true,
        },
        requirements: String,
        totalPrice: Number,
        validity: String,
    },
    currentState: {
        type: Number,
        default: 0,
        required: true,
    },
    status: {
        type: String,
        enum: [
            'incomplete',
            'pending',
            'approved',
            'rejected',
            'payment',
            'member',
        ],
        default: 'pending',
        required: true,
    },
    reasonForRejection: {
        type: String,
        default: '',
    },
});

const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;
