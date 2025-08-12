import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_MOVIE, GET_ALL_MOVIES } from '../graphql/operations';

export function CreateMovieForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createMovie, { loading, error }] = useMutation(CREATE_MOVIE, {
    refetchQueries: [{ query: GET_ALL_MOVIES }],
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createMovie({
      variables: { input: { title: title.trim(), description: description.trim() || null } },
    });
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      <h2>Create Movie</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <button type="submit" disabled={loading}>Create</button>
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </form>
  );
} 