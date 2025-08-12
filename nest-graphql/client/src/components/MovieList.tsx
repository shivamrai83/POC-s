import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_MOVIES } from '../graphql/operations';

export function MovieList() {
  const { data, loading, error } = useQuery(GET_ALL_MOVIES);

  if (loading) return <p>Loading movies...</p>;
  if (error) return <p style={{ color: 'red' }}>{error.message}</p>;

  return (
    <div>
      <h2>All Movies</h2>
      {data.getAllMovies.length === 0 ? (
        <p>No movies yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {data.getAllMovies.map((m: any) => (
            <li key={m.id} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{m.title ?? '(untitled)'}</div>
              {m.description && <div style={{ color: '#555' }}>{m.description}</div>}
              <div style={{ fontSize: 12, color: '#777' }}>
                Comments: {Array.isArray(m.movieComment) ? m.movieComment.join(', ') : '—'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 