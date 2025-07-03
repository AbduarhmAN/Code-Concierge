# Installation Guide

This guide provides detailed installation instructions for Code Concierge.

## Prerequisites

- **Node.js**: Version 14.x or higher
- **npm**: Usually comes with Node.js
- **Git**: For cloning the repository

### Installing Node.js

#### Windows
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Verify installation: `node --version`

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/AbduarhmAN/code-concierge.git
cd code-concierge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=3000
GITHUB_TOKEN=your_github_personal_access_token_here
```

### 4. Start the Application

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

### 5. Access the Application

Open your browser and navigate to: `http://localhost:3000`

## GitHub Token Setup

For analyzing private repositories or to increase rate limits:

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Add the token to your `.env` file

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Change PORT in .env file or kill process
lsof -ti:3000 | xargs kill -9
```

**Dependencies installation fails:**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**GitHub API rate limit:**
- Add a GitHub token to increase limits
- Wait for the rate limit to reset (usually 1 hour)

## Docker Installation (Optional)

```bash
# Build image
docker build -t code-concierge .

# Run container
docker run -p 3000:3000 code-concierge
```

## Verification

Test the installation:

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok","version":"1.0.0"}`