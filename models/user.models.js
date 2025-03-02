import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        lower: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please enter a valid email address',
        ],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['superAdmin', 'eventAdmin', 'membershipAdmin'],
        default: 'user',
    },
    refreshToken: {
        type: String,
    },
});

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        this.password = bcrypt.hashSync(this.password, 10);
    }
    next();
});

userSchema.methods.isPasswordCorrect = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });
};

const User = mongoose.model('User', userSchema);
export default User;
