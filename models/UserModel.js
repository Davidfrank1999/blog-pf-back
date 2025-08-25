import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ALL_ROLES, ROLES} from "../constants/roles.js"

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false, // do not return password field by default
        },
        roles: {
            type: [String],
            enum: ALL_ROLES,
            default: [ROLES.USER],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
},{timestamps: true});

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    };
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// Method to compare given password with the hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);