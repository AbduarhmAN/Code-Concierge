/**
 * Format languages data for display
 * @param {Object} languages - Raw languages data from GitHub API
 * @returns {Object} - Formatted languages with percentages
 */
export function formatLanguages(languages) {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  
  if (total === 0) return {};
  
  const formatted = {};
  Object.entries(languages)
    .sort(([,a], [,b]) => b - a)
    .forEach(([language, bytes]) => {
      formatted[language] = {
        bytes,
        percentage: ((bytes / total) * 100).toFixed(1)
      };
    });
  
  return formatted;
}

/**
 * Calculate commit frequency based on recent commits
 * @param {Array} commits - Array of commit data
 * @returns {string} - Frequency level (high, medium, low)
 */
export function calculateCommitFrequency(commits) {
  if (!commits || commits.length === 0) return 'low';
  
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit?.author?.date || commit.date || new Date());
    return commitDate > oneWeekAgo;
  });
  
  if (recentCommits.length >= 5) return 'high';
  if (recentCommits.length >= 2) return 'medium';
  return 'low';
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format number with appropriate suffix (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}