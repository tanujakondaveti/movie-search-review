import { useRef, useEffect, memo } from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = memo(function SearchInput({
  value,
  onChange,
  placeholder = 'Search movies by title...',
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors duration-200" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all duration-200 text-lg"
      />
      {value ? (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center px-2 py-1 text-xs text-slate-600 bg-slate-800/80 border border-slate-700/50 rounded-lg">
          /
        </kbd>
      )}
    </div>
  );
});

export default SearchInput;
