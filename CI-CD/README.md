# Todo Application

A beautiful and modern full-stack todo application with React frontend and Express backend.

## Features

- ✨ Create, read, update, and delete todos
- ✅ Mark todos as complete/incomplete
- 💾 Persistent storage using SQLite database
- 🎨 Modern and responsive UI
- 🚀 RESTful API

## Project Structure

```
CI-CD/
├── backend/           # Express.js API server
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── todos.db      # SQLite database (created on first run)
│
└── frontend/         # React application
    ├── public/       # Static files
    ├── src/          # React components and styles
    └── package.json  # Frontend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend API will run on `http://localhost:5000`

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `GET /api/health` - Health check endpoint

## Usage

1. Start both the backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. Add new todos using the input field
4. Click the checkbox to mark todos as complete
5. Click the delete button to remove todos

## Technologies Used

### Backend
- Express.js - Web framework
- SQLite3 - Database
- CORS - Cross-origin resource sharing

### Frontend
- React - UI library
- Modern CSS with animations
- Fetch API for HTTP requests

## Development

The frontend is configured with a proxy to the backend, so API calls like `/api/todos` will automatically be forwarded to `http://localhost:5000/api/todos` during development.

## Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

## License

ISC

