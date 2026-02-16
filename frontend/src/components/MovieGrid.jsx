import MovieCard from './MovieCard';

function MovieGrid({ movies, lastRef }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
      {movies.map((movie, index) => {
        const isLast = index === movies.length - 1;
        return (
          <div key={movie.imdbID} ref={isLast ? lastRef : null}>
            <MovieCard movie={movie} />
          </div>
        );
      })}
    </div>
  );
}

export default MovieGrid;
