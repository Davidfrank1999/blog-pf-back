export const validateBlogPostBody = (title) => {

  if (!title) {
    return "Title is required";
  }


  return null; // no error
};
