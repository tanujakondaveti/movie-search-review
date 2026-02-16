import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SearchPage from './pages/SearchPage';
import MovieDetailsPage from './pages/MovieDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SearchPage />} />
          <Route path="/movie/:imdbID" element={<MovieDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
