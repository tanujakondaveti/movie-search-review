import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ImageOff } from 'lucide-react';

const MovieCard = memo(function MovieCard({ movie }) {
  const hasImage = movie.Poster && movie.Poster !== 'N/A';

  return (
    <Link
      to={`/movie/${movie.imdbID}`}
      className="group block rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-300 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-1"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-slate-800">
        {hasImage ? (
          <img
            src={movie.Poster}
            alt={movie.Title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
            <ImageOff className="w-12 h-12 mb-2" />
            <span className="text-sm">No poster</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-3.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-slate-100 group-hover:text-amber-400 transition-colors duration-200">
          {movie.Title}
        </h3>
        <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>{movie.Year}</span>
        </div>
      </div>
    </Link>
  );
});

export default MovieCard;
