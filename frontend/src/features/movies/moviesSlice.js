import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  searchMovies as searchMoviesApi,
  getMovieDetails as getMovieDetailsApi,
} from '../../api/omdbApi';

export const searchMovies = createAsyncThunk(
  'movies/search',
  async ({ query, page }, { getState, rejectWithValue }) => {
    const cacheKey = `${query.toLowerCase().trim()}_${page}`;
    const cached = getState().movies.searchCache[cacheKey];
    if (cached) return { ...cached, query, page, fromCache: true };

    try {
      const result = await searchMoviesApi(query, page);
      return { ...result, query, page, fromCache: false };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMovieDetails = createAsyncThunk(
  'movies/fetchDetails',
  async (imdbID, { getState, rejectWithValue }) => {
    const cached = getState().movies.detailsCache[imdbID];
    if (cached) return { data: cached, fromCache: true };

    try {
      const data = await getMovieDetailsApi(imdbID);
      return { data, fromCache: false };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    movies: [],
    currentQuery: '',
    currentPage: 1,
    totalResults: 0,
    loading: false,
    error: null,
    searchCache: {},
    selectedMovie: null,
    detailsLoading: false,
    detailsError: null,
    detailsCache: {},
  },
  reducers: {
    clearSearch: (state) => {
      state.movies = [];
      state.currentQuery = '';
      state.currentPage = 1;
      state.totalResults = 0;
      state.error = null;
    },
    clearMovieDetails: (state) => {
      state.selectedMovie = null;
      state.detailsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMovies.pending, (state, action) => {
        const { query, page } = action.meta.arg;
        const cacheKey = `${query.toLowerCase().trim()}_${page}`;
        if (!state.searchCache[cacheKey]) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        const { movies, totalResults, query, page, fromCache } = action.payload;

        if (!fromCache) {
          const cacheKey = `${query.toLowerCase().trim()}_${page}`;
          state.searchCache[cacheKey] = { movies, totalResults };
        }

        if (page === 1) {
          state.movies = movies;
        } else {
          const existingIds = new Set(state.movies.map((m) => m.imdbID));
          const newMovies = movies.filter((m) => !existingIds.has(m.imdbID));
          state.movies = [...state.movies, ...newMovies];
        }

        state.currentQuery = query;
        state.currentPage = page;
        state.totalResults = totalResults;
        state.loading = false;
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
      .addCase(fetchMovieDetails.pending, (state, action) => {
        const imdbID = action.meta.arg;
        if (!state.detailsCache[imdbID]) {
          state.detailsLoading = true;
        }
        state.detailsError = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        const { data, fromCache } = action.payload;
        if (!fromCache) {
          state.detailsCache[data.imdbID] = data;
        }
        state.selectedMovie = data;
        state.detailsLoading = false;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError =
          action.payload || 'Failed to fetch movie details';
      });
  },
});

export const { clearSearch, clearMovieDetails } = moviesSlice.actions;
export default moviesSlice.reducer;
