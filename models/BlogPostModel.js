import mongoose from 'mongoose';
// creating blog model

const blogPostSchema = new mongoose.Schema({
    title:{ type: String, required: true, trim: true },
    content:{ type: String },
    tags:{ type: [String], default: [], trim: true },
    author:{ type: mongoose.Schema.Types.ObjectId, required: true, trim: true },
    visibility:{ type: String, enum: ['public', 'private'], default: 'public' },
},{timestamps: true});

const PostModel = mongoose.model('Post', blogPostSchema);

export default PostModel;