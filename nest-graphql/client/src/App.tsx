import React from 'react';
import { MovieList } from './components/MovieList';
import { CreateMovieForm } from './components/CreateMovieForm';

export default function App() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, fontFamily: 'system-ui, Arial, sans-serif' }}>
      <h1>Nest GraphQL Client</h1>
      <CreateMovieForm />
      <hr style={{ margin: '24px 0' }} />
      <MovieList />
    </div>
  );
} 