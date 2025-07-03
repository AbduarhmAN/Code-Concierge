/**
 * Parse repository URL to extract owner and name
 * @param {string} repoUrl - Repository URL or owner/repo format
 * @returns {Object} - Object with owner and repo properties
 */
export function parseRepositoryUrl(repoUrl) {
  // Handle different URL formats
  const patterns = [
    // GitHub URL: https://github.com/owner/repo
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\.git)?(?:\/.*)?$/,
    // SSH URL: git@github.com:owner/repo.git
    /^git@github\.com:([^/]+)\/([^/]+)(?:\.git)?$/,
    // Simple owner/repo format
    /^([^/]+)\/([^/]+)$/
  ];
  
  for (const pattern of patterns) {
    const match = repoUrl.trim().match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '')
      };
    }
  }
  
  throw new Error('Invalid repository URL format. Use owner/repo or GitHub URL');
}

/**
 * Validate GitHub token format
 * @param {string} token - GitHub Personal Access Token
 * @returns {boolean} - Whether token format is valid
 */
export function validateGitHubToken(token) {
  if (!token) return false;
  
  // GitHub classic tokens start with ghp_ and are 40 characters total
  // GitHub fine-grained tokens start with github_pat_ 
  const patterns = [
    /^ghp_[a-zA-Z0-9]{36}$/,
    /^github_pat_[a-zA-Z0-9_]{82}$/,
    /^gho_[a-zA-Z0-9]{36}$/, // OAuth tokens
    /^ghu_[a-zA-Z0-9]{36}$/, // User-to-server tokens
    /^ghs_[a-zA-Z0-9]{36}$/, // Server-to-server tokens
    /^ghr_[a-zA-Z0-9]{36}$/  // Refresh tokens
  ];
  
  return patterns.some(pattern => pattern.test(token));
}

/**
 * Extract meaningful information from commit messages
 * @param {Array} commits - Array of commit objects
 * @returns {Object} - Commit analysis
 */
export function analyzeCommitMessages(commits) {
  if (!commits || commits.length === 0) {
    return { patterns: [], types: {} };
  }
  
  const types = {};
  const patterns = [];
  
  commits.forEach(commit => {
    const message = commit.commit?.message || '';
    const firstLine = message.split('\n')[0].toLowerCase();
    
    // Detect conventional commit patterns
    const conventionalMatch = firstLine.match(/^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?\s*:\s*.+/);
    if (conventionalMatch) {
      const type = conventionalMatch[1];
      types[type] = (types[type] || 0) + 1;
      patterns.push('conventional');
    }
    
    // Detect other common patterns
    if (firstLine.includes('merge')) {
      patterns.push('merge');
    } else if (firstLine.includes('update') || firstLine.includes('upgrade')) {
      patterns.push('update');
    } else if (firstLine.includes('add') || firstLine.includes('implement')) {
      patterns.push('feature');
    } else if (firstLine.includes('fix') || firstLine.includes('bug')) {
      patterns.push('bugfix');
    }
  });
  
  return {
    patterns: [...new Set(patterns)],
    types,
    totalCommits: commits.length
  };
}