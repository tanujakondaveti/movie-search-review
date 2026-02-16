import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Film, TrendingUp, Popcorn } from 'lucide-react';
import SearchInput from '../components/SearchInput';
import MovieGrid from '../components/MovieGrid';
import { MovieGridSkeleton } from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import { useDebounce } from '../hooks/useDebounce';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { searchMovies, clearSearch } from '../features/movies/moviesSlice';

const SUGGESTIONS = [
  'Inception',
  'The Matrix',
  'Interstellar',
  'The Dark Knight',
  'Pulp Fiction',
  'Fight Club',
  'Gladiator',
  'Forrest Gump',
];

function SearchPage() {
  const dispatch = useDispatch();
  const { movies, currentQuery, currentPage, totalResults, loading, error } =
    useSelector((state) => state.movies);

  const [searchText, setSearchText] = useState(currentQuery);
  const debouncedQuery = useDebounce(searchText, 500);

  const hasMore = useMemo(
    () => movies.length < totalResults,
    [movies.length, totalResults]
  );

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed) {
      dispatch(searchMovies({ query: trimmed, page: 1 }));
    } else {
      dispatch(clearSearch());
    }
  }, [debouncedQuery, dispatch]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && currentQuery) {
      dispatch(searchMovies({ query: currentQuery, page: currentPage + 1 }));
    }
  }, [loading, hasMore, currentQuery, currentPage, dispatch]);

  const lastElementRef = useInfiniteScroll(loadMore, { hasMore, loading });

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchText(suggestion);
  }, []);

  const handleRetry = useCallback(() => {
    if (currentQuery) {
      dispatch(searchMovies({ query: currentQuery, page: currentPage }));
    }
  }, [currentQuery, currentPage, dispatch]);

  const showHero = !currentQuery && movies.length === 0;

  return (
    <div>
      {showHero && (
        <div className="text-center pt-8 pb-12 sm:pt-20 sm:pb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 mb-8">
            <Film className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
            Discover &{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Review
            </span>{' '}
            Movies
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            Search thousands of movies, explore details, and share your reviews.
          </p>
        </div>
      )}

      <div className={`${showHero ? 'max-w-2xl mx-auto' : ''} mb-8`}>
        <SearchInput value={searchText} onChange={setSearchText} />
      </div>

      {showHero && (
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-slate-600 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            Popular searches
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestionClick(s)}
                className="px-4 py-2 bg-slate-900/60 border border-slate-800/60 rounded-full text-sm text-slate-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentQuery && !error && movies.length > 0 && (
        <p className="text-sm text-slate-500 mb-5">
          Showing {movies.length} of {totalResults} results for &ldquo;
          {currentQuery}&rdquo;
        </p>
      )}

      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {!error && movies.length > 0 && (
        <MovieGrid movies={movies} lastRef={lastElementRef} />
      )}

      {loading && (
        <div className={movies.length > 0 ? 'mt-6' : ''}>
          <MovieGridSkeleton count={movies.length > 0 ? 5 : 10} />
        </div>
      )}

      {!loading && !error && currentQuery && movies.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center mx-auto mb-5">
            <Popcorn className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-300 text-lg font-medium">
            No movies found for &ldquo;{currentQuery}&rdquo;
          </p>
          <p className="text-slate-600 text-sm mt-2">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
