import axios from 'axios';

const JSON_SERVER_URL = import.meta.env.SERVER_URL;

/**
 * Fetch paginated reviews for a specific movie
 * @param {string} imdbID - The movie's IMDB ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Reviews per page (default: 10)
 * @returns {Promise<Object>} Object with movie, reviews, and pagination data
 */
export const fetchReviewsByMovieId = async (imdbID, page = 1, limit = 10) => {
    try {
        const response = await axios.get(`${JSON_SERVER_URL}/movies/${imdbID}/reviews`, {
            params: { page, limit }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
};

/**
 * Add a new review to a movie
 * @param {string} imdbID - The movie's IMDB ID
 * @param {Object} review - The review object to add
 * @returns {Promise<Object>} Created review with id and createdAt
 */
export const addReviewToMovie = async (imdbID, review) => {
    try {
        const response = await axios.post(`${JSON_SERVER_URL}/movies/${imdbID}/reviews`, review);
        return response.data;
    } catch (error) {
        console.error('Error adding review:', error);
        throw error;
    }
};

/**
 * Delete a review by ID
 * @param {string} reviewId - The review ID to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteReviewFromMovie = async (reviewId) => {
    try {
        const response = await axios.delete(`${JSON_SERVER_URL}/reviews/${reviewId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
    }
};

/**
 * Update movie review summary and sentiment counts
 * @param {string} imdbID - The movie's IMDB ID
 * @param {string} summary - Review summary text
 * @param {Object} sentimentCounts - Object with good, average, bad counts
 * @returns {Promise<Object>} Updated movie document
 */
export const updateMovieSummary = async (imdbID, summary, sentimentCounts) => {
    try {
        const response = await axios.patch(`${JSON_SERVER_URL}/movies/${imdbID}/summary`, {
            reviewSummary: summary,
            sentimentCounts
        });
        return response.data;
    } catch (error) {
        console.error('Error updating movie summary:', error);
        throw error;
    }
};
