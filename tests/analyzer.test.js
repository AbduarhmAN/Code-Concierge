// Analyzer service tests
const analyzer = require('../src/services/analyzer');

describe('Repository Analyzer Service', () => {
  const mockRepoData = {
    repoInfo: {
      full_name: 'test/repo',
      description: 'Test repository',
      html_url: 'https://github.com/test/repo',
      stargazers_count: 100,
      forks_count: 20,
      open_issues_count: 5,
      watchers_count: 50,
      license: { spdx_id: 'MIT' },
      created_at: new Date('2020-01-01').toISOString(),
      updated_at: new Date().toISOString(),
      homepage: null,
      default_branch: 'main',
      size: 1024,
      private: false
    },
    languages: {
      'JavaScript': 60000,
      'CSS': 20000,
      'HTML': 10000
    },
    commits: [
      {
        sha: 'abc123def456',
        commit: {
          message: 'Initial commit',
          author: {
            name: 'Test User',
            date: new Date().toISOString()
          }
        },
        author: { login: 'testuser' }
      }
    ],
    contributors: [
      {
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
        contributions: 10,
        html_url: 'https://github.com/testuser'
      }
    ],
    issues: [
      { state: 'open' },
      { state: 'open' },
      { state: 'closed' },
      { state: 'closed' },
      { state: 'closed' }
    ],
    releases: [
      {
        name: 'v1.0.0',
        published_at: new Date().toISOString(),
        html_url: 'https://github.com/test/repo/releases/tag/v1.0.0',
        prerelease: false
      }
    ],
    codeFrequency: []
  };

  test('should analyze repository data correctly', () => {
    const result = analyzer.default.analyzeRepository(mockRepoData);
    
    expect(result.repo.name).toBe('test/repo');
    expect(result.repo.description).toBe('Test repository');
    expect(result.repo.stars).toBe(100);
    expect(result.repo.license).toBe('MIT');
    
    expect(result.languages).toHaveProperty('JavaScript');
    expect(result.commits).toHaveLength(1);
    expect(result.contributors).toHaveLength(1);
    
    expect(result.issues.open).toBe(2);
    expect(result.issues.closed).toBe(3);
    expect(result.issues.total).toBe(5);
    
    expect(result.stats).toHaveProperty('health');
    expect(result.stats).toHaveProperty('activity');
    expect(result.stats).toHaveProperty('popularity');
    
    expect(result.insights).toHaveProperty('technical');
    expect(result.insights).toHaveProperty('business');
    expect(result.insights).toHaveProperty('general');
  });

  test('should generate meaningful insights', () => {
    const result = analyzer.default.analyzeRepository(mockRepoData);
    
    expect(result.insights.technical.main).toContain('JavaScript');
    expect(result.insights.business.main).toBeTruthy();
    expect(result.insights.general.main).toContain('test/repo');
    
    expect(result.insights.technical.details).toBeInstanceOf(Array);
    expect(result.insights.business.details).toBeInstanceOf(Array);
    expect(result.insights.general.details).toBeInstanceOf(Array);
  });

  test('should calculate scores correctly', () => {
    const result = analyzer.default.analyzeRepository(mockRepoData);
    
    expect(result.stats.health.score).toBeGreaterThanOrEqual(0);
    expect(result.stats.health.score).toBeLessThanOrEqual(100);
    
    expect(result.stats.activity.score).toBeGreaterThanOrEqual(0);
    expect(result.stats.activity.score).toBeLessThanOrEqual(100);
    
    expect(result.stats.popularity.score).toBeGreaterThanOrEqual(0);
    expect(result.stats.popularity.score).toBeLessThanOrEqual(100);
  });
});