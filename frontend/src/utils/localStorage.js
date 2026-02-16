const REVIEWS_KEY = 'cinesearch_reviews';

export const loadReviews = () => {
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveReviews = (reviews) => {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch {
    // localStorage full or unavailable
  }
};
