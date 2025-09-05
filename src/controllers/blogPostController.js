import PostModel from '../../models/BlogPostModel.js'
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { validateBlogPostBody } from '../../validators/blogPostValidation.js'

export const blogPostCreate = async (req, res) =>{
    const { title, content, tags, visibility } = req.body;
    const err = validateBlogPostBody(title);
    if (err) throw new ApiError(400, err)

    const newBlogPost = new PostModel({
        title,
        content,
        tags,
        visibility,
        author: req.user._id // from auth middleware
    });
    await newBlogPost.save()
    return res.status(201).json(new ApiResponse(201, "Blog post create successfully", newBlogPost))

}