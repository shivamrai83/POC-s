# 🚀 Todo Application with CI/CD Pipeline

A modern full-stack todo application demonstrating best practices for CI/CD, automated testing, and cloud deployment. Features a React frontend, Express.js backend, and complete CI/CD pipeline with GitHub Actions and Render.com.

## 📋 Overview

This project showcases a production-ready todo application with:
- Beautiful, responsive React frontend
- RESTful Express.js API backend
- SQLite database for persistence
- Automated CI/CD pipeline with GitHub Actions
- Cloud deployment on Render.com
- Comprehensive documentation

## ✨ Features

### Frontend
- ✨ Modern, responsive UI with animations
- ✅ Create, read, update, and delete todos
- 🎨 Beautiful styling with CSS animations
- 📱 Mobile-friendly design
- ⚡ Fast and performant

### Backend
- 🔒 RESTful API design
- 💾 SQLite database persistence
- 🏥 Health check endpoint
- 🛡️ Error handling
- 📊 Structured logging

### DevOps
- 🤖 Automated testing with GitHub Actions
- 🚀 Automated deployment to Render.com
- 📦 Blueprint-based deployment configuration
- ✅ Pre-deployment validation
- 🔄 Zero-downtime deployments

## 🏗 Architecture

```
CI-CD/
├── backend/              # Express.js API server
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── todos.db         # SQLite database
│
├── frontend/             # React application
│   ├── public/          # Static files
│   ├── src/             # React components
│   │   ├── App.js       # Main component
│   │   ├── App.css      # Styles
│   │   └── index.js     # Entry point
│   └── package.json     # Frontend dependencies
│
├── .github/
│   └── workflows/       # GitHub Actions workflows
│
├── render.yaml          # Render.com deployment config
├── README.md            # This file
└── QUICK_START.md       # Quick deployment guide
```

## 🛠 Technology Stack

### Frontend
- **React** - UI library
- **Modern CSS** - Styling with animations
- **Fetch API** - HTTP requests

### Backend
- **Express.js** - Web framework
- **SQLite3** - Database
- **CORS** - Cross-origin resource sharing
- **Body-parser** - Request parsing

### DevOps
- **GitHub Actions** - CI/CD automation
- **Render.com** - Cloud hosting
- **Docker** (optional) - Containerization

## 📦 Installation

### Prerequisites
- Node.js 14+ and npm
- Git
- GitHub account
- Render.com account (for deployment)

### Local Development Setup

1. **Clone the repository**:
   ```bash
   cd CI-CD
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend runs on `http://localhost:5000`

3. **Frontend Setup** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## 🚀 Quick Start

### 5-Minute Deployment

See [QUICK_START.md](./QUICK_START.md) for a step-by-step deployment guide.

### Manual Setup

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/todo-app.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Option A: Use `render.yaml` blueprint (recommended)
   - Option B: Manual service creation

## 📡 API Endpoints

### `GET /api/todos`
Get all todos.

**Response**:
```json
[
  {
    "id": 1,
    "text": "Buy groceries",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### `GET /api/todos/:id`
Get a specific todo by ID.

**Response**:
```json
{
  "id": 1,
  "text": "Buy groceries",
  "completed": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### `POST /api/todos`
Create a new todo.

**Request Body**:
```json
{
  "text": "New todo item"
}
```

**Response**: Created todo object

### `PUT /api/todos/:id`
Update a todo.

**Request Body**:
```json
{
  "text": "Updated text",
  "completed": true
}
```

**Response**: Updated todo object

### `DELETE /api/todos/:id`
Delete a todo.

**Response**: `{ "message": "Todo deleted" }`

### `GET /api/health`
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The project includes automated CI/CD via GitHub Actions:

1. **On Push to Main**:
   - Run tests
   - Validate code quality
   - Trigger deployment (if configured)

2. **On Pull Request**:
   - Run tests
   - Code quality checks
   - Prevent merge if tests fail

### Workflow Steps

```yaml
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests (if configured)
5. Build application
6. Deploy to Render (if on main branch)
```

## 🚢 Deployment

### Render.com Deployment

#### Option A: Blueprint (Recommended)

1. Login to [Render.com](https://render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub repository
4. Render automatically reads `render.yaml` and creates services
5. Click **Deploy**

#### Option B: Manual Deployment

**Backend Service**:
1. New → Web Service
2. Connect repository
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment: Node

**Frontend Static Site**:
1. New → Static Site
2. Connect repository
3. Root Directory: `frontend`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `build`
6. Add environment variable: `REACT_APP_API_URL`

### Environment Variables

**Backend** (if needed):
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (production/development)

**Frontend**:
- `REACT_APP_API_URL` - Backend API URL (e.g., `https://todo-backend.onrender.com`)

## 📁 Project Structure

### Backend (`backend/`)

- **server.js**: Main Express server
  - Sets up routes
  - Database initialization
  - Error handling
  - CORS configuration

- **todos.db**: SQLite database file (created automatically)

### Frontend (`frontend/`)

- **src/App.js**: Main React component
  - Todo list management
  - API integration
  - State management

- **src/App.css**: Styling
  - Modern animations
  - Responsive design
  - Color scheme

- **public/index.html**: HTML template

### CI/CD Configuration

- **.github/workflows/**: GitHub Actions workflows
- **render.yaml**: Render.com deployment blueprint

## 🧪 Testing

### Manual Testing

1. **Start both servers** (backend and frontend)
2. **Test CRUD operations**:
   - Create a todo
   - Mark as complete
   - Update text
   - Delete todo
3. **Test persistence**: Refresh page, todos should remain

### Automated Testing

Add tests to the project:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🔧 Development

### Development Mode

**Backend** (with auto-reload):
```bash
cd backend
npm run dev  # If nodemon is configured
```

**Frontend** (with hot reload):
```bash
cd frontend
npm start  # React dev server with hot reload
```

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build
```
Creates optimized production build in `build/` directory.

**Backend**:
```bash
cd backend
npm start
```

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `REACT_APP_API_URL` is set correctly
- Verify backend is running
- Check CORS configuration in backend

### Database errors
- Ensure SQLite file has write permissions
- Check database file path is correct

### Deployment issues
- Check Render logs for errors
- Verify environment variables are set
- Ensure build commands are correct

## 📚 Additional Documentation

- [QUICK_START.md](./QUICK_START.md) - Fast deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment instructions
- [CI-CD-FLOW.md](./CI-CD-FLOW.md) - CI/CD pipeline explanation

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets
2. **CORS**: Configure allowed origins properly
3. **Input Validation**: Validate all user inputs
4. **SQL Injection**: Use parameterized queries (already implemented)
5. **Rate Limiting**: Consider adding rate limiting for production

## 📈 Future Enhancements

- [ ] User authentication
- [ ] Multi-user support
- [ ] Todo categories/tags
- [ ] Due dates and reminders
- [ ] Search and filtering
- [ ] Export/import functionality
- [ ] Dark mode
- [ ] Offline support (PWA)

## 📝 License

ISC License

---

**Demonstrating modern CI/CD practices and full-stack development**
