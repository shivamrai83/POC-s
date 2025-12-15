# 🔍 Code Quality Workflow

This document explains the code quality checks that run automatically on every pull request and push to main/develop branches.

## 📋 Overview

The code quality workflow (`.github/workflows/code-quality.yml`) automatically:
- ✅ Lints backend code with ESLint
- ✅ Lints frontend code with ESLint
- ✅ Checks code formatting with Prettier
- ✅ Provides summary reports in GitHub Actions

## 🚀 How It Works

### Automatic Triggers

The workflow runs automatically on:
- **Pull Requests**: When PR is opened, updated, or reopened
- **Pushes**: When code is pushed to `main` or `develop` branches

### What Gets Checked

#### Backend (`CI-CD/backend/`)
- ESLint validation (`.eslintrc.js`)
- Prettier formatting check (`.prettierrc`)
- JavaScript syntax validation

#### Frontend (`CI-CD/frontend/`)
- ESLint validation (react-app config)
- Prettier formatting check (`.prettierrc`)
- React/JSX syntax validation

## 📝 Local Usage

### Backend

```bash
cd CI-CD/backend

# Install dependencies (first time)
npm install

# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Check code formatting
npm run format:check

# Auto-format code
npm run format
```

### Frontend

```bash
cd CI-CD/frontend

# Install dependencies (first time)
npm install

# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Check code formatting
npm run format:check

# Auto-format code
npm run format
```

## 🔧 Configuration Files

### ESLint

- **Backend**: `CI-CD/backend/.eslintrc.js`
- **Frontend**: Uses react-scripts default (configured in `package.json`)

### Prettier

- **Backend**: `CI-CD/backend/.prettierrc`
- **Frontend**: `CI-CD/frontend/.prettierrc`

### Ignore Files

- `.eslintignore` - Files to skip during linting
- `.prettierignore` - Files to skip during formatting

## 📊 Viewing Results

### In GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Code Quality** workflow
4. Click on the latest run
5. View results for each job:
   - `Lint Backend`
   - `Lint Frontend`
   - `Code Quality Summary`

### Summary Report

The workflow generates a summary report that shows:
- ✅ Which checks passed
- ⚠️ Which checks had warnings
- 💡 Tips for enabling additional checks

## 🐛 Troubleshooting

### Workflow Fails

If the workflow fails:

1. **Check the logs** in GitHub Actions
2. **Run locally** to see the same errors:
   ```bash
   # Backend
   cd CI-CD/backend && npm run lint
   
   # Frontend
   cd CI-CD/frontend && npm run lint
   ```
3. **Fix errors** and push again

### Common Issues

#### "ESLint not configured"
- Install ESLint: `npm install --save-dev eslint`
- Run: `npx eslint --init` to configure

#### "Prettier not configured"
- Install Prettier: `npm install --save-dev prettier`
- The workflow will automatically use it

#### Formatting Conflicts
- Run `npm run format` to auto-fix
- Commit the formatted files

## 💡 Best Practices

1. **Run checks locally before pushing**:
   ```bash
   npm run lint && npm run format:check
   ```

2. **Auto-fix when possible**:
   ```bash
   npm run lint:fix && npm run format
   ```

3. **Commit formatted code**:
   - Always format code before committing
   - Use pre-commit hooks (optional)

4. **Review workflow results**:
   - Check GitHub Actions after pushing
   - Fix any issues before merging PRs

## 🔄 Integration with Other Workflows

This workflow runs in parallel with:
- `ci-cd.yml` - Main CI/CD pipeline
- `pr-check.yml` - PR validation

All workflows must pass before code can be merged.

## 📚 Additional Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Happy Coding! 🎉**

