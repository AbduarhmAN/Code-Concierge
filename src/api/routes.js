import express from 'express';
import * as github from './github.js';
import analyzer from '../services/analyzer.js';

const router = express.Router();

/**
 * Analyze a GitHub repository
 * @route GET /api/analyze/:owner/:repo
 */
router.get('/analyze/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const { token } = req.query;
  
  try {
    // Validate owner/repo format
    if (!owner || !repo) {
      return res.status(400).json({ error: 'Invalid repository format. Use owner/repo' });
    }
    
    // Fetch all repository data in parallel
    const [
      repoInfo, 
      languages, 
      commits, 
      contributors,
      issues,
      releases,
      codeFrequency
    ] = await Promise.all([
      github.getRepository(owner, repo, token),
      github.getLanguages(owner, repo, token),
      github.getCommits(owner, repo, 10, token),
      github.getContributors(owner, repo, 10, token),
      github.getIssues(owner, repo, 'all', 20, token),
      github.getReleases(owner, repo, 5, token),
      github.getCodeFrequency(owner, repo, token).catch(() => []) // This endpoint sometimes fails
    ]);
    
    // Process and analyze the data
    const analysis = analyzer.analyzeRepository({
      repoInfo,
      languages,
      commits,
      contributors,
      issues,
      releases,
      codeFrequency
    });
    
    res.json(analysis);
  } catch (error) {
    console.error(`Analysis error for ${owner}/${repo}:`, error);
    
    // Handle specific error cases
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ error: error.message });
    }
    
    if (error.message.includes('404')) {
      return res.status(404).json({ error: `Repository ${owner}/${repo} not found` });
    }
    
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get repository dependencies (if available via package.json)
 * @route GET /api/dependencies/:owner/:repo
 */
router.get('/dependencies/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const { token, branch = 'main' } = req.query;
  
  try {
    // Try to fetch package.json from the repository
    const packageJson = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Package.json not found');
        }
        return response.json();
      })
      .catch(() => null);
    
    if (!packageJson) {
      return res.status(404).json({ error: 'Dependencies information not available' });
    }
    
    const dependencies = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    
    res.json({ dependencies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check endpoint
 * @route GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

export default router;