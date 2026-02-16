import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';
import { addReviewAsync, selectReviewsLoading, selectReviewsError, fetchMovieReviewsAsync } from '../features/reviews/reviewsSlice';
import { validateReview } from '../utils/validation';

const initialFormState = { rating: 0, text: '', name: '', email: '' };

function ReviewForm({ movieId }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loading = useSelector(selectReviewsLoading);
  const apiError = useSelector(selectReviewsError);

  // Handle API errors
  useEffect(() => {
    if (isSubmitting && loading === 'failed' && apiError) {
      setSubmitError('Review submission failed. Please try again.');
      setIsSubmitting(false);

      // Auto-dismiss error after 5 seconds
      const timer = setTimeout(() => {
        setSubmitError(null);
      }, 5000);

      return () => clearTimeout(timer);
    } else if (isSubmitting && loading === 'succeeded') {
      setSubmitted(true);
      setIsSubmitting(false);
      setSubmitError(null);

      // Refetch reviews to get updated summary and counts
      dispatch(fetchMovieReviewsAsync({ movieId, page: 1, limit: 10 }));

      setTimeout(() => setSubmitted(false), 3000);
    }
  }, [loading, apiError, isSubmitting, movieId, dispatch]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      if (field === 'name' || field === 'email') delete next.identity;
      return next;
    });
    // Clear submit error when user starts typing
    if (submitError) setSubmitError(null);
  }, [submitError]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const { isValid, errors: validationErrors } = validateReview(form);

      if (!isValid) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      dispatch(
        addReviewAsync({
          movieId,
          review: {
            rating: form.rating,
            text: form.text.trim(),
            name: form.name.trim(),
            email: form.email.trim(),
          },
        })
      );

      setForm(initialFormState);
      setErrors({});
    },
    [form, movieId, dispatch]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2.5">
          Your Rating
        </label>
        <StarRating
          value={form.rating}
          onChange={(val) => handleChange('rating', val)}
          size="lg"
        />
        {errors.rating && (
          <p className="mt-2 text-sm text-red-400">{errors.rating}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Your Review
        </label>
        <textarea
          value={form.text}
          onChange={(e) => handleChange('text', e.target.value)}
          rows={4}
          placeholder="Share your thoughts about this movie..."
          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all duration-200 resize-none"
        />
        {errors.text && (
          <p className="mt-1.5 text-sm text-red-400">{errors.text}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all duration-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all duration-200"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
          )}
        </div>
      </div>

      {errors.identity && (
        <p className="text-sm text-red-400">{errors.identity}</p>
      )}

      {submitError && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-400">{submitError}</p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-red-400 hover:text-red-300 transition-colors"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2.5 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-colors duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {submitted && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            Review submitted!
          </span>
        )}
      </div>
    </form>
  );
}

export default ReviewForm;
