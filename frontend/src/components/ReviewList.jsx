import { useMemo, memo, useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, MessageSquare, ThumbsUp, ThumbsDown, Minus, AlertCircle, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import {
  selectReviewsByMovieId,
  selectAverageRating,
  selectMovieData,
  selectReviewsLoading,
  selectReviewsError,
  selectPagination,
  selectHasMoreReviews,
  fetchMovieReviewsAsync,
} from '../features/reviews/reviewsSlice';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const ReviewSummary = memo(function ReviewSummary({ summary, sentimentCounts }) {
  const total = sentimentCounts.good + sentimentCounts.average + sentimentCounts.bad;

  // Only show if BOTH summary exists AND there are sentiment counts
  if (!summary || total === 0) return null;

  const getPercentage = (count) => total > 0 ? (count / total) * 100 : 0;

  const sentiments = [
    {
      label: 'Positive',
      count: sentimentCounts.good,
      percentage: getPercentage(sentimentCounts.good),
      icon: ThumbsUp,
      color: 'emerald',
      bgColor: 'bg-emerald-500/20',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      iconColor: 'text-emerald-500'
    },
    {
      label: 'Neutral',
      count: sentimentCounts.average,
      percentage: getPercentage(sentimentCounts.average),
      icon: Minus,
      color: 'amber',
      bgColor: 'bg-amber-500/20',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-400',
      iconColor: 'text-amber-500'
    },
    {
      label: 'Negative',
      count: sentimentCounts.bad,
      percentage: getPercentage(sentimentCounts.bad),
      icon: ThumbsDown,
      color: 'rose',
      bgColor: 'bg-rose-500/20',
      barColor: 'bg-rose-500',
      textColor: 'text-rose-400',
      iconColor: 'text-rose-500'
    }
  ];

  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      {summary && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            Review Summary
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {total > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wide">
            Sentiment Breakdown
          </h3>
          <div className="space-y-3">
            {sentiments.map((sentiment) => (
              <div key={sentiment.label} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${sentiment.bgColor} flex items-center justify-center`}>
                      <sentiment.icon className={`w-4 h-4 ${sentiment.iconColor}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-300">
                      {sentiment.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${sentiment.textColor}`}>
                      {sentiment.count}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({sentiment.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${sentiment.barColor} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${sentiment.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const ReviewItem = memo(function ReviewItem({ review, isLast, lastElementRef }) {
  const timeAgo = useMemo(() => formatTimeAgo(review.createdAt), [review.createdAt]);

  return (
    <div
      ref={isLast ? lastElementRef : null}
      className="p-5 bg-slate-900/40 border border-slate-800/50 rounded-xl transition-colors duration-200 hover:border-slate-700/50"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white text-sm truncate">
              {review.name || 'Anonymous'}
            </p>
            {review.email && (
              <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 shrink-0" />
                {review.email}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs text-slate-600 shrink-0">{timeAgo}</span>
      </div>
      <StarRating value={review.rating} readOnly size="sm" />
      <p className="mt-3 text-slate-300 text-sm leading-relaxed">
        {review.text}
      </p>
    </div>
  );
});

function ReviewList({ movieId }) {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasInitialized, setHasInitialized] = useState(false);

  const reviews = useSelector((state) =>
    selectReviewsByMovieId(state, movieId)
  );
  const avgRating = useSelector((state) =>
    selectAverageRating(state, movieId)
  );
  const movieData = useSelector((state) =>
    selectMovieData(state, movieId)
  );
  const loading = useSelector(selectReviewsLoading);
  const error = useSelector(selectReviewsError);
  const pagination = useSelector((state) => selectPagination(state, movieId));
  const hasMore = useSelector((state) => selectHasMoreReviews(state, movieId));

  // Initial fetch
  useEffect(() => {
    if (!hasInitialized && movieId) {
      dispatch(fetchMovieReviewsAsync({ movieId, page: 1, limit: 10 }));
      setHasInitialized(true);
      setCurrentPage(1);
    }
  }, [movieId, dispatch, hasInitialized]);

  // Load more reviews
  const loadMore = useCallback(() => {
    if (hasMore && loading !== 'loading') {
      const nextPage = currentPage + 1;
      dispatch(fetchMovieReviewsAsync({ movieId, page: nextPage, limit: 10 }));
      setCurrentPage(nextPage);
    }
  }, [hasMore, loading, currentPage, movieId, dispatch]);

  const lastElementRef = useInfiniteScroll(loadMore, {
    hasMore,
    loading: loading === 'loading',
  });

  // Show error state if fetching reviews failed
  if (loading === 'failed' && error && reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-red-400 font-medium mb-2">
          Failed to load reviews
        </p>
        <p className="text-slate-500 text-sm">
          {error || 'An error occurred while fetching reviews. Please try again later.'}
        </p>
      </div>
    );
  }

  if (reviews.length === 0 && loading !== 'loading') {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-7 h-7 text-slate-600" />
        </div>
        <p className="text-slate-500 text-sm">
          No reviews yet. Be the first to share your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div>
      {reviews.length > 0 && (
        <>
          <div className="flex items-center gap-5 mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400">
                {avgRating.toFixed(1)}
              </p>
              <StarRating value={Math.round(avgRating)} readOnly size="sm" />
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-slate-400 text-sm">
              <p>
                Based on{' '}
                <span className="text-white font-medium">
                  {pagination?.totalReviews || reviews.length}
                </span>{' '}
                {(pagination?.totalReviews || reviews.length) === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {movieData && movieData.reviewSummary && movieData.sentimentCounts &&
            (movieData.sentimentCounts.good + movieData.sentimentCounts.average + movieData.sentimentCounts.bad) > 0 && (
              <ReviewSummary
                summary={movieData.reviewSummary}
                sentimentCounts={movieData.sentimentCounts}
              />
            )}

          <div className="space-y-3">
            {reviews.map((review, index) => (
              <ReviewItem
                key={review.id || review._id}
                review={review}
                isLast={index === reviews.length - 1}
                lastElementRef={lastElementRef}
              />
            ))}
          </div>

          {loading === 'loading' && reviews.length > 0 && (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="ml-2 text-sm text-slate-400">Loading more reviews...</span>
            </div>
          )}

          {!hasMore && reviews.length > 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500">
                You've reached the end of the reviews
              </p>
            </div>
          )}
        </>
      )}

      {loading === 'loading' && reviews.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="ml-3 text-slate-400">Loading reviews...</span>
        </div>
      )}
    </div>
  );
}

export default ReviewList;
