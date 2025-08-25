
export const validateRegisterBody = (body) => {
  const { name, email, password } = body;
  if (!name || !email || !password) {
    return(false, 'Missing required fields');
  }
  if (password.length < 6) {
    return(false, 'Password must be at least 6 characters long');
  }
    
  return(true, null);
};

export const validateLoginBody = (body) => {
  const { email, password } = body;
  if (!email || !password) {
    return(false, 'Missing required fields');
  }
  return(true, null);
};