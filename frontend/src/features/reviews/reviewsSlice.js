import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchReviewsByMovieId,
  addReviewToMovie,
  deleteReviewFromMovie,
} from '../../api/reviewsApi';

// Async thunks
export const fetchMovieReviewsAsync = createAsyncThunk(
  'reviews/fetchMovieReviews',
  async ({ movieId, page = 1, limit = 10 }) => {
    const data = await fetchReviewsByMovieId(movieId, page, limit);
    return {
      movieId,
      reviews: data.reviews,
      movie: data.movie,
      pagination: data.pagination,
      page,
    };
  }
);

export const addReviewAsync = createAsyncThunk(
  'reviews/addReview',
  async ({ movieId, review }) => {
    const newReview = await addReviewToMovie(movieId, review);
    return {
      movieId,
      review: newReview,
    };
  }
);

export const deleteReviewAsync = createAsyncThunk(
  'reviews/deleteReview',
  async ({ reviewId, movieId }) => {
    await deleteReviewFromMovie(reviewId);
    return {
      movieId,
      reviewId,
    };
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    byMovieId: {},
    loading: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearReviews: (state, action) => {
      const movieId = action.payload;
      if (movieId) {
        delete state.byMovieId[movieId];
      } else {
        state.byMovieId = {};
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch movie reviews
      .addCase(fetchMovieReviewsAsync.pending, (state) => {
        state.loading = 'loading';
      })
      .addCase(fetchMovieReviewsAsync.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const { movieId, reviews, movie, pagination, page } = action.payload;

        if (!state.byMovieId[movieId]) {
          state.byMovieId[movieId] = {
            reviews: [],
            reviewSummary: '',
            sentimentCounts: { good: 0, average: 0, bad: 0 },
            pagination: null,
          };
        }

        // If page 1, replace reviews; otherwise append for infinite scroll
        if (page === 1) {
          state.byMovieId[movieId].reviews = reviews;
        } else {
          state.byMovieId[movieId].reviews = [
            ...state.byMovieId[movieId].reviews,
            ...reviews,
          ];
        }

        // Update movie metadata
        if (movie) {
          state.byMovieId[movieId].reviewSummary = movie.reviewSummary || '';
          state.byMovieId[movieId].sentimentCounts = movie.sentimentCounts || {
            good: 0,
            average: 0,
            bad: 0,
          };
        }

        state.byMovieId[movieId].pagination = pagination;
      })
      .addCase(fetchMovieReviewsAsync.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      // Add review
      .addCase(addReviewAsync.pending, (state) => {
        state.loading = 'loading';
      })
      .addCase(addReviewAsync.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const { movieId, review } = action.payload;

        if (!state.byMovieId[movieId]) {
          state.byMovieId[movieId] = {
            reviews: [],
            reviewSummary: '',
            sentimentCounts: { good: 0, average: 0, bad: 0 },
            pagination: null,
          };
        }

        // Prepend new review to the list
        state.byMovieId[movieId].reviews = [
          review,
          ...state.byMovieId[movieId].reviews,
        ];

        // Update pagination count
        if (state.byMovieId[movieId].pagination) {
          state.byMovieId[movieId].pagination.totalReviews += 1;
        }
      })
      .addCase(addReviewAsync.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      // Delete review
      .addCase(deleteReviewAsync.pending, (state) => {
        state.loading = 'loading';
      })
      .addCase(deleteReviewAsync.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const { movieId, reviewId } = action.payload;

        if (state.byMovieId[movieId]) {
          state.byMovieId[movieId].reviews = state.byMovieId[
            movieId
          ].reviews.filter((r) => r.id !== reviewId);

          // Update pagination count
          if (state.byMovieId[movieId].pagination) {
            state.byMovieId[movieId].pagination.totalReviews -= 1;
          }

          // If no reviews left, clean up
          if (state.byMovieId[movieId].reviews.length === 0) {
            delete state.byMovieId[movieId];
          }
        }
      })
      .addCase(deleteReviewAsync.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      });
  },
});

// Selectors
export const selectReviewsByMovieId = (state, movieId) =>
  state.reviews.byMovieId[movieId]?.reviews || [];

export const selectAverageRating = (state, movieId) => {
  const movieData = state.reviews.byMovieId[movieId];
  if (!movieData || !movieData.reviews || movieData.reviews.length === 0)
    return 0;
  const sum = movieData.reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / movieData.reviews.length;
};

export const selectReviewSummary = (state, movieId) =>
  state.reviews.byMovieId[movieId]?.reviewSummary || '';

export const selectSentimentCounts = (state, movieId) =>
  state.reviews.byMovieId[movieId]?.sentimentCounts || {
    good: 0,
    average: 0,
    bad: 0,
  };

export const selectMovieData = (state, movieId) =>
  state.reviews.byMovieId[movieId] || null;

export const selectPagination = (state, movieId) =>
  state.reviews.byMovieId[movieId]?.pagination || null;

export const selectHasMoreReviews = (state, movieId) =>
  state.reviews.byMovieId[movieId]?.pagination?.hasMore || false;

export const selectReviewsLoading = (state) => state.reviews.loading;
export const selectReviewsError = (state) => state.reviews.error;

export const { clearReviews } = reviewsSlice.actions;

export default reviewsSlice.reducer;
