import fetch from 'node-fetch';
import cache from '../services/cache.js';

const BASE_URL = 'https://api.github.com';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Make authenticated request to GitHub API
 * @param {string} endpoint - API endpoint
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Promise<Object>} - JSON response
 */
async function githubRequest(endpoint, token) {
  const cacheKey = `github_${endpoint}_${token ? 'auth' : 'noauth'}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Code-Concierge'
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    
    // Handle rate limiting
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const resetDate = new Date(resetTime * 1000);
      throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`${response.status} ${response.statusText} - ${errorData.message || endpoint}`);
    }
    
    const data = await response.json();
    
    // Cache the successful response
    cache.put(cacheKey, data, CACHE_DURATION);
    
    return data;
  } catch (error) {
    console.error(`GitHub API Error: ${error.message}`);
    throw error;
  }
}

/**
 * Get repository information
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Promise<Object>} - Repository data
 */
export async function getRepository(owner, repo, token) {
  return githubRequest(`/repos/${owner}/${repo}`, token);
}

/**
 * Get repository languages
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Promise<Object>} - Languages data
 */
export async function getLanguages(owner, repo, token) {
  return githubRequest(`/repos/${owner}/${repo}/languages`, token);
}

/**
 * Get repository commits
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} perPage - Number of commits to fetch
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Promise<Array>} - Commits data
 */
export async function getCommits(owner, repo, perPage = 10, token) {
  return githubRequest(`/repos/${owner}/${repo}/commits?per_page=${perPage}`, token);
}

/**
 * Get repository contributors
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} perPage - Number of contributors to fetch
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Promise<Array>} - Contributors data
 */
export async function getContributors(owner, repo, perPage = 10, token) {
  return githubRequest(`/repos/${owner}/${repo}/contributors?per_page=${perPage}`, token);
}

/**
 * Get repository issues
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} state - Issue state (open, closed, all)
 * @param {number} perPage - Number of issues to fetch
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Promise<Array>} - Issues data
 */
export async function getIssues(owner, repo, state = 'open', perPage = 10, token) {
  return githubRequest(`/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}`, token);
}

/**
 * Get repository releases
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} perPage - Number of releases to fetch
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Promise<Array>} - Releases data
 */
export async function getReleases(owner, repo, perPage = 5, token) {
  return githubRequest(`/repos/${owner}/${repo}/releases?per_page=${perPage}`, token);
}

/**
 * Get repository code frequency stats
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub Personal Access Token (optional)
 * @returns {Promise<Array>} - Code frequency data
 */
export async function getCodeFrequency(owner, repo, token) {
  return githubRequest(`/repos/${owner}/${repo}/stats/code_frequency`, token);
}

export default {
  getRepository,
  getLanguages,
  getCommits,
  getContributors,
  getIssues,
  getReleases,
  getCodeFrequency
};