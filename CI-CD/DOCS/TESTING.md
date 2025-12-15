# 🧪 Testing Guide

This document explains the testing infrastructure for the Todo application.

## 📋 Overview

The project uses:
- **Jest** - Test framework for both backend and frontend
- **Supertest** - HTTP assertion library for backend API testing
- **React Testing Library** - React component testing utilities
- **Coverage Reports** - Code coverage tracking

## 🏗️ Test Structure

```
CI-CD/
├── backend/
│   ├── __tests__/
│   │   ├── server.test.js          # API endpoint tests
│   │   └── helpers/
│   │       └── test-server.js      # Test server helper
│   ├── jest.config.js              # Jest configuration
│   └── coverage/                   # Coverage reports (generated)
│
└── frontend/
    ├── src/
    │   ├── App.test.js             # Component tests
    │   └── setupTests.js           # Test setup
    └── coverage/                   # Coverage reports (generated)
```

## 🚀 Running Tests

### Backend Tests

```bash
cd CI-CD/backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests for CI (with coverage)
npm run test:ci
```

### Frontend Tests

```bash
cd CI-CD/frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests for CI (with coverage)
npm run test:ci
```

## 📊 Test Coverage

### Coverage Thresholds

Backend coverage thresholds (configured in `jest.config.js`):
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Viewing Coverage

After running tests, coverage reports are generated in:
- Backend: `CI-CD/backend/coverage/`
- Frontend: `CI-CD/frontend/coverage/`

Open `coverage/lcov-report/index.html` in a browser to view detailed coverage.

## 🧩 Test Examples

### Backend API Tests

```javascript
test('POST /api/todos should create a new todo', async () => {
  const newTodo = { title: 'Test Todo' };
  
  const response = await request(app)
    .post('/api/todos')
    .send(newTodo)
    .expect(201);

  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('title', 'Test Todo');
});
```

### Frontend Component Tests

```javascript
test('displays todos from API', async () => {
  const mockTodos = [
    { id: 1, title: 'Test Todo 1', completed: 0 },
  ];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockTodos,
  });

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
  });
});
```

## 🔄 CI/CD Integration

Tests run automatically on:
- **Pull Requests** - All tests must pass before merging
- **Push to main/develop** - Full test suite with coverage

### GitHub Actions Workflow

The `.github/workflows/test.yml` workflow:
1. Runs backend tests
2. Runs frontend tests
3. Generates coverage reports
4. Uploads coverage to artifacts
5. Creates test summary

## 📝 Writing Tests

### Backend Test Guidelines

1. **Use test database**: Tests use a separate test database
2. **Clean up**: Each test clears data before running
3. **Test all endpoints**: Cover all CRUD operations
4. **Test error cases**: Include 400, 404, 500 responses
5. **Use descriptive names**: Test names should explain what they test

### Frontend Test Guidelines

1. **Mock API calls**: Use `fetch.mockResolvedValueOnce()` for API calls
2. **Test user interactions**: Use `fireEvent` for clicks, inputs, etc.
3. **Use async/await**: Handle async operations with `waitFor`
4. **Test edge cases**: Empty states, errors, loading states
5. **Accessibility**: Use `getByRole`, `getByLabelText` for better queries

## 🐛 Troubleshooting

### Tests Failing Locally

1. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear Jest cache**:
   ```bash
   npm test -- --clearCache
   ```

3. **Check database**: Ensure test database is being created/cleaned properly

### Coverage Issues

1. **Low coverage**: Add more test cases
2. **Missing files**: Check `jest.config.js` coverage paths
3. **Coverage not updating**: Clear coverage directory and rerun

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🎉**

