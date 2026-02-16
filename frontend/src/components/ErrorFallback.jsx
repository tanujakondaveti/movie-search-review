import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ErrorFallback({ error, resetErrorBoundary }) {
    // Using window.location for full reload as it might be safer for boundary resets, 
    // but if we were inside a Router context here we could use navigate.
    // Generally, error boundaries are outside the router or wrap routes. 
    // If we wrap the whole app, we might not have router context if the router itself fails.
    // For a global boundary, a full reload is often the safest "reset".

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 ring-1 ring-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Something went wrong
            </h1>

            <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                {error.message || "An unexpected error occurred while loading the application."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={resetErrorBoundary}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>

                <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-colors duration-200"
                >
                    <Home className="w-4 h-4" />
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default ErrorFallback;
