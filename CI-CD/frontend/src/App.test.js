import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders todo list header', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);
    expect(screen.getByText(/My Todo List/i)).toBeInTheDocument();
  });

  test('displays empty state when no todos', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/No todos yet/i)).toBeInTheDocument();
    });
  });

  test('displays todos from API', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo 1', completed: 0 },
      { id: 2, title: 'Test Todo 2', completed: 1 },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  test('adds a new todo', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/What needs to be done/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/What needs to be done/i);
    const addButton = screen.getByText('Add');

    const newTodo = { id: 1, title: 'New Todo', completed: 0 };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newTodo,
    });

    fireEvent.change(input, { target: { value: 'New Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument();
    });
  });

  test('toggles todo completion', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo', completed: 0 },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    
    const updatedTodo = { id: 1, title: 'Test Todo', completed: 1 };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => updatedTodo,
    });

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ completed: true }),
        })
      );
    });
  });

  test('deletes a todo', async () => {
    const mockTodos = [
      { id: 1, title: 'Delete Me', completed: 0 },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Delete Me')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('Delete todo');
    
    fetch.mockResolvedValueOnce({
      ok: true,
    });

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/todos/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  test('displays error message on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load todos/i)).toBeInTheDocument();
    });
  });

  test('displays stats correctly', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', completed: 1 },
      { id: 2, title: 'Todo 2', completed: 1 },
      { id: 3, title: 'Todo 3', completed: 0 },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTodos,
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/2 of 3 completed/i)).toBeInTheDocument();
    });
  });
});

