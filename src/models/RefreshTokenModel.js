import mongoose from 'mongoose';


//You can revoke tokens (e.g., logout or compromise).
//Track active sessions per user.
const refreshTokenSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        refreshToken: { type: String, required: true, index: true , unique: true},
        expiresAt: { type: Date, required: true },
        revoked: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Automatically delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', refreshTokenSchema);