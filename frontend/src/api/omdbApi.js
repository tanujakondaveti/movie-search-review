import axios from 'axios';

const API_KEY = import.meta.env.OMDB_API_KEY;
const BASE_URL = import.meta.env.OMDB_BASE_URL;

const omdbClient = axios.create({
  baseURL: BASE_URL,
  params: { apikey: API_KEY },
});

export const searchMovies = async (query, page = 1) => {
  if (!API_KEY) {
    throw new Error(
      'OMDb API key is not configured. Add OMDB_API_KEY to your .env file.'
    );
  }

  const response = await omdbClient.get('/', {
    params: { s: query, page, type: 'movie' },
  });

  if (response.data.Response === 'False') {
    throw new Error(response.data.Error || 'No results found');
  }

  return {
    movies: response.data.Search,
    totalResults: parseInt(response.data.totalResults, 10),
  };
};

export const getMovieDetails = async (imdbID) => {
  if (!API_KEY) {
    throw new Error(
      'OMDb API key is not configured. Add OMDB_API_KEY to your .env file.'
    );
  }

  const response = await omdbClient.get('/', {
    params: { i: imdbID, plot: 'full' },
  });

  if (response.data.Response === 'False') {
    throw new Error(response.data.Error || 'Movie not found');
  }

  return response.data;
};
