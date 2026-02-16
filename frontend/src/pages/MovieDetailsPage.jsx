import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Star,
  Award,
  Users,
  Video,
  Globe,
  ImageOff,
  DollarSign,
} from 'lucide-react';
import {
  fetchMovieDetails,
  clearMovieDetails,
} from '../features/movies/moviesSlice';
import { DetailsSkeleton } from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import {
  selectAverageRating,
  selectReviewsByMovieId,
} from '../features/reviews/reviewsSlice';

function InfoBadge({ icon: Icon, label, value }) {
  if (!value || value === 'N/A') return null;
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
      <Icon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-sm text-slate-200 leading-snug mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function MovieDetailsPage() {
  const { imdbID } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selectedMovie: movie,
    detailsLoading,
    detailsError,
  } = useSelector((state) => state.movies);
  const avgRating = useSelector((state) => selectAverageRating(state, imdbID));
  const reviews = useSelector((state) =>
    selectReviewsByMovieId(state, imdbID)
  );

  useEffect(() => {
    if (imdbID) {
      dispatch(fetchMovieDetails(imdbID));
    }
    return () => dispatch(clearMovieDetails());
  }, [imdbID, dispatch]);

  const handleRetry = useCallback(() => {
    dispatch(fetchMovieDetails(imdbID));
  }, [imdbID, dispatch]);

  if (detailsLoading) return <DetailsSkeleton />;
  if (detailsError)
    return <ErrorMessage message={detailsError} onRetry={handleRetry} />;
  if (!movie) return null;

  const hasImage = movie.Poster && movie.Poster !== 'N/A';
  const imdbRating =
    movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null;

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="w-full sm:w-72 lg:w-80 shrink-0 mx-auto lg:mx-0">
          <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 shadow-2xl shadow-black/40 ring-1 ring-slate-700/50">
            {hasImage ? (
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                <ImageOff className="w-16 h-16 mb-2" />
                <span>No poster available</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {movie.Title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-slate-400">
            {movie.Year && movie.Year !== 'N/A' && <span>{movie.Year}</span>}
            {movie.Rated && movie.Rated !== 'N/A' && (
              <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-300">
                {movie.Rated}
              </span>
            )}
            {movie.Runtime && movie.Runtime !== 'N/A' && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {movie.Runtime}
              </span>
            )}
            {movie.Genre && movie.Genre !== 'N/A' && (
              <div className="flex flex-wrap gap-1.5">
                {movie.Genre.split(', ').map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-8 mb-8">
            {imdbRating && (
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{imdbRating}</p>
                  <p className="text-xs text-slate-500">IMDb Rating</p>
                </div>
              </div>
            )}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-teal-400 fill-teal-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {reviews.length} user{' '}
                    {reviews.length === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {movie.Plot && movie.Plot !== 'N/A' && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Plot
              </h2>
              <p className="text-slate-300 leading-relaxed text-[15px]">
                {movie.Plot}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <InfoBadge icon={Users} label="Director" value={movie.Director} />
            <InfoBadge icon={Users} label="Cast" value={movie.Actors} />
            <InfoBadge icon={Video} label="Writer" value={movie.Writer} />
            <InfoBadge icon={Globe} label="Language" value={movie.Language} />
            <InfoBadge icon={Globe} label="Country" value={movie.Country} />
            <InfoBadge icon={Award} label="Awards" value={movie.Awards} />
            <InfoBadge icon={Calendar} label="Released" value={movie.Released} />
            <InfoBadge
              icon={DollarSign}
              label="Box Office"
              value={movie.BoxOffice}
            />
          </div>

          {movie.Ratings && movie.Ratings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                External Ratings
              </h2>
              <div className="flex flex-wrap gap-3">
                {movie.Ratings.map((r) => (
                  <div
                    key={r.Source}
                    className="px-4 py-3 bg-slate-900/50 rounded-xl border border-slate-800/50"
                  >
                    <p className="text-lg font-bold text-white">{r.Value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.Source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-14 pt-10 border-t border-slate-800/50">
        <h2 className="text-2xl font-bold mb-10">User Reviews</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <h3 className="text-base font-semibold text-slate-300 mb-5">
              Write a Review
            </h3>
            <ReviewForm movieId={imdbID} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-300 mb-5">
              All Reviews
            </h3>
            <ReviewList movieId={imdbID} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailsPage;
