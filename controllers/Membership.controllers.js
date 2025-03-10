import { ApiError, ApiResponse } from '../utils/index.js';
import Membership from '../models/Membership.models.js';
import User from '../models/user.models.js';
const createMembership = async (req, res) => {
    const {
        personal,
        organizational,
        membershipType,
        currentState,
        isSuccessFul,
        reasonForRejection,
        status,
    } = req.body;
    try {
        if (!validatePersonal(personal)) {
            throw new Error('make sure all the personal information is valid');
        }
        if (!validateOrganizational(organizational)) {
            throw new Error(
                'make sure all the organizational information is valid'
            );
        }
        if (!validateMembershipType(membershipType)) {
            throw new Error(
                'make sure all the membership information is valid'
            );
        }

        if (currentState < 0) {
            throw new Error('make sure current state is valid');
        }
        if (
            !status ||
            ![
                'incomplete',
                'pending',
                'approved',
                'payment',
                'member',
            ].includes(status)
        ) {
            throw new Error('make sure status is valid');
        }

        const createdMembership = await Membership.create({
            personal,
            organizational,
            membershipType,
            currentState,
            isSuccessFul: isSuccessFul || false,
            reasonForRejection,
            status: status || 'incomplete',
        });

        if (!createdMembership) throw new Error('error in creating membership');

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    createdMembership,
                    'membership created successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .json(
                new ApiError(500, 'error in creating membership', error.message)
            );
    }
};

const validatePersonal = (personal) => {
    const {
        firstName,
        lastName,
        DOB,
        Nationality,
        panCardNumber,
        address,
        pincode,
        phone,
        email,
    } = personal;

    if (!firstName || firstName.trim() === '') {
        return false;
    }
    if (!lastName || lastName.trim() === '') {
        return false;
    }
    if (!DOB || DOB.trim() === '') {
        return false;
    }
    if (!Nationality || Nationality.trim() === '') {
        return false;
    }
    if (!panCardNumber || panCardNumber.trim() === '') {
        return false;
    }
    if (!address || address.trim() === '') {
        return false;
    }
    if (!pincode || pincode.trim() === '') {
        return false;
    }
    if (!phone || phone.trim() === '') {
        return false;
    }
    if (!email || email.trim() === '') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return false;
    }

    return true;
};
const validateOrganizational = (organizational) => {
    const {
        designation,
        organization,
        highestQualification,
        officeAddress,
        mainFieldsOfInterest,
        pinCode,
    } = organizational;
    if (!designation || designation.trim() === '') {
        return false;
    }
    if (!organization || organization.trim() === '') {
        return false;
    }
    if (!highestQualification || highestQualification.trim() === '') {
        return false;
    }
    if (!officeAddress || officeAddress.trim() === '') {
        return false;
    }
    if (!pinCode || pinCode.trim() === '') {
        return false;
    }
    if (mainFieldsOfInterest.length === 0) {
        return false;
    }
    return true;
};
const validateMembershipType = (membershipType) => {
    const { basePrice, gst, name, requirements, totalPrice, validity } =
        membershipType;
    if (!basePrice || basePrice < 0) {
        return false;
    }
    if (!gst || gst <= 0) {
        return false;
    }
    if (
        !name ||
        ![
            'Corporate',
            'Individual',
            'Student (B.Tech/B.Sc/Diploma)',
            'Student (M.Tech/MS/PhD)',
            'Student to Individual',
        ].includes(name)
    ) {
        return false;
    }
    if (!totalPrice || totalPrice <= 0) {
        return false;
    }
    if (!validity || validity.trim() === '') {
        return false;
    }
    return true;
};
const updateMembershipInfo = async (req, res) => {
    const user = req.user._id;
    const { id: membershipid } = req.params;
    const { personal, organizational, membershipType } = req.body;
    try {
        if (!validatePersonal(personal)) {
            throw new Error('make sure all the personal information is valid');
        }
        if (!validateOrganizational(organizational)) {
            throw new Error(
                'make sure all the organizational information is valid'
            );
        }
        if (!validateMembershipType(membershipType)) {
            throw new Error(
                'make sure all the membership information is valid'
            );
        }

        if (!user) {
            throw new Error('user token not found, kindly relogin');
        }
        if (!membershipid) {
            throw new Error('membership id not found');
        }

        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser) {
            throw new Error('no such user found');
        }

        if (dbUser.role === 'eventAdmin') {
            throw new Error("event admin can't update membership");
        }

        const dbMembership = await Membership.findById(membershipid);
        if (!dbMembership) {
            throw new Error('no such membership found');
        }

        const updatedMembership = await Membership.findByIdAndUpdate(
            dbMembership._id,
            {
                personal,
                organizational,
                membershipType,
            },
            { new: true }
        );

        if (!updatedMembership) throw new Error('error in updating membership');

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedMembership,
                    'membership updated successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .json(
                new ApiError(500, 'error in updating membership', error.message)
            );
    }
};
const rejectMembership = async (req, res) => {
    const user = req.user._id;
    const { id: membershipid } = req.params;
    const { reasonForRejection } = req.body;

    try {
        if (!user) throw new Error('user token not found, kindly relogin');
        if (!membershipid) throw new Error('membership id not found');

        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser) throw new Error('no such user found');

        if (dbUser.role === 'eventAdmin')
            throw new Error("event admin can't reject membership");
        const dbMembership = await Membership.findById(membershipid);
        if (!dbMembership) throw new Error('no such membership found');

        const updatedMembership = await Membership.findByIdAndUpdate(
            dbMembership._id,
            {
                reasonForRejection,
                status: 'rejected',
            },
            { new: true }
        );

        if (!updatedMembership)
            throw new Error('error in rejecting membership');

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedMembership,
                    'membership rejected successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .json(
                new ApiError(
                    500,
                    'error in rejecting membership',
                    error.message
                )
            );
    }
};
const generateAccessOTP = async (req, res) => {
    const { trackingId } = req.body;
    try {
        if (!trackingId) throw new Error('trackingId not found');
        const dbMembership = await Membership.find({
            $or: [
                { 'personal.email': trackingId },
                { 'personal.phone': trackingId },
                { 'personal.panCardNumber': trackingId },
            ],
        });
        if (!dbMembership) throw new Error('no such membership found');

        const otp = Math.floor(100000 + Math.random() * 900000);

        return res
            .status(200)
            .json(
                new ApiResponse(200, { otp, user: dbMembership }, 'OTP sent')
            );
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .json(new ApiError(500, 'error in generating OTP', error.message));
    }
};
const changeMembershipStatus = async (req, res) => {
    const { id: membershipId } = req.params;
    const user = req.user._id;
    const { status } = req.body;

    try {
        if (!user) throw new Error('user token not found, kindly relogin');
        if (!membershipId) throw new Error('membership id not found');
        if (!status) throw new Error('please provide a status');

        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser) throw new Error('no such user found');
        if (dbUser.role === 'eventAdmin')
            throw new Error("event admin can't change membership status");

        const dbMembership = await Membership.findById(membershipId);
        if (!dbMembership) throw new Error('no such membership found');
        if (!['approved', 'payment', 'member'].includes(status))
            throw new Error('invalid status provided');

        let reasonForRejection = dbMembership.reasonForRejection;
        let isSuccessFul = false;

        if (
            status === 'approved' ||
            status === 'payment' ||
            status === 'member'
        ) {
            reasonForRejection = '';
            isSuccessFul = true;
        }
        const updatedMembership = await Membership.findByIdAndUpdate(
            dbMembership._id,
            {
                status,
                reasonForRejection:
                    reasonForRejection || dbMembership.reasonForRejection,
                isSuccessFul: isSuccessFul || dbMembership.isSuccessFul,
            },
            { new: true }
        );

        if (!updatedMembership)
            throw new Error('error in changing membership status');
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedMembership,
                    'membership status changed successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .json(
                new ApiError(
                    500,
                    'error in changing membership status',
                    error.message
                )
            );
    }
};
const getMembershipInfo = async (req, res) => {
    const { text: membershipId } = req.body;
    const user = req.user._id;

    try {
        if (!user) throw new Error('user token not found, kindly relogin');
        if (!membershipId) throw new Error('membership id not found');

        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser) throw new Error('no such user found');
        if (dbUser.role === 'eventAdmin')
            throw new Error('event admin can not get membership info');

        const dbMembership = await Membership.find({
            $or: [
                { 'personal.email': membershipId },
                { 'personal.phone': membershipId },
                { 'personal.panCardNumber': membershipId },
                // { _id: membershipId },
            ],
        });
        if (!dbMembership) throw new Error('no such membership found');

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    dbMembership,
                    'membership info fetched successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .json(
                new ApiError(
                    500,
                    'error in getting membership info',
                    error.message
                )
            );
    }
};

const getMembershipById = async (req, res) => {
    const { membership: membershipId } = req.params;
    const user = req.user._id;
    try {
        if (!user) throw new Error('user token not found, kindly relogin');
        if (!membershipId) throw new Error('membership id not found');

        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser) throw new Error('no such user found');
        if (dbUser.role === 'eventAdmin')
            throw new Error('event admin can not get membership info');

        const dbMembership = await Membership.findById(membershipId);
        if (!dbMembership) throw new Error('no such member found');

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    dbMembership,
                    'membership info fetched successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(400)
            .json(
                new ApiError(
                    500,
                    'error in getting membership info',
                    error.message
                )
            );
    }
};

const getMembershipByStatus = async (req, res) => {
    const user = req.user._id;
    const { status } = req.body;
    try {
        if (!user) throw new Error('user token not found, kindly relogin');
        if (!status) throw new Error('status not found');
        const dbUser = await User.findById(user).select(
            '-password -refreshToken'
        );
        if (!dbUser) throw new Error('no such user found');
        if (dbUser.role === 'eventAdmin')
            throw new Error('event admin can not get membership info');
        const dbMembership = await Membership.find({ status });
        if (!dbMembership) throw new Error('no such membership found');
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    dbMembership,
                    'membership info fetched successfully'
                )
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(
                    500,
                    'error in getting membership info',
                    error.message
                )
            );
    }
};
export {
    createMembership,
    generateAccessOTP,
    rejectMembership,
    updateMembershipInfo,
    changeMembershipStatus,
    getMembershipInfo,
    getMembershipByStatus,
    getMembershipById,
};
