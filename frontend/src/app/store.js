import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from '../features/movies/moviesSlice';
import reviewsReducer from '../features/reviews/reviewsSlice';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    reviews: reviewsReducer,
  },
});
