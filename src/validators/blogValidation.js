export const validateBlogPostBody = ({ title, excerpt, content, visibility }) => {
  if (!title?.trim()) return "Title is required";
  if (!excerpt?.trim()) return "Excerpt is required";
  if (!content) return "Content is required";
  if (visibility && !["public", "private"].includes(visibility)) {
    return "Invalid visibility option";
  }
  return null; // no error
};
  // Further validations can be added as needed