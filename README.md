# Code Concierge

> A comprehensive GitHub repository analyzer that provides insights from technical, business, and general perspectives.

![License](https://img.shields.io/github/license/AbduarhmAN/code-concierge)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## ✨ Features

- **Multi-perspective Analysis**: View repositories from technical, business, and general angles
- **Live GitHub Data**: Real-time analysis of any public GitHub repository
- **Private Repository Support**: Analyze private repositories with GitHub Personal Access Token
- **Dependency Analysis**: Scan for outdated or vulnerable dependencies
- **Code Quality Metrics**: Analyze code complexity and maintenance needs
- **Export Reports**: Download reports in PDF, JSON, or CSV formats
- **Local Operation**: Runs entirely on your local machine

## 🚀 Quick Start

1. **Prerequisites**
   - Node.js 14.x or higher
   - npm or yarn

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/AbduarhmAN/code-concierge.git
   
   # Navigate to project directory
   cd code-concierge
   
   # Install dependencies
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Enter a GitHub repository (e.g., `facebook/react`)
   - Click "Analyze Repository"

## 📊 Screenshots

![Dashboard](https://placeholder.com/dashboard.png)
![Technical Analysis](https://placeholder.com/technical.png)
![Business Metrics](https://placeholder.com/business.png)

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
GITHUB_TOKEN=your_github_personal_access_token_here
```

## 🏗️ Architecture

```
src/
├── api/           # GitHub API integration
├── services/      # Business logic and analysis
├── utils/         # Utility functions
└── server.js      # Express server

public/
├── js/            # Frontend JavaScript
├── css/           # Stylesheets
└── index.html     # Main HTML file
```

## 🛠️ Development

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](docs/CONTRIBUTING.md) for details.

## 🔮 Roadmap

See our [roadmap](docs/ROADMAP.md) for planned features and improvements.