const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateReview = ({ rating, text, name, email }) => {
  const errors = {};

  if (!rating || rating < 1 || rating > 5) {
    errors.rating = 'Rating is required (1-5 stars)';
  }

  if (!text || !text.trim()) {
    errors.text = 'Review text is required';
  }

  if (!name?.trim() && !email?.trim()) {
    errors.identity = 'Name or email is required';
  }

  if (email?.trim() && !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
