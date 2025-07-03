// Integration tests for analyzer with edge cases and comprehensive coverage
import analyzer from '../src/services/analyzer.js';

describe('Analyzer Service - Comprehensive Tests', () => {
  describe('Edge Cases and Error Handling', () => {
    test('should handle empty repository data', () => {
      const emptyData = {
        repoInfo: {
          full_name: '',
          description: '',
          stargazers_count: 0,
          forks_count: 0,
          open_issues_count: 0,
          watchers_count: 0,
          license: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          homepage: null,
          default_branch: 'main',
          size: 0,
          private: false
        },
        languages: {},
        commits: [],
        contributors: [],
        issues: [],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(emptyData);
      
      expect(result.repo).toBeDefined();
      expect(result.languages).toBeDefined();
      expect(result.commits).toHaveLength(0);
      expect(result.contributors).toHaveLength(0);
      expect(result.issues.total).toBe(0);
      expect(result.stats.health.score).toBeGreaterThanOrEqual(0);
    });

    test('should handle malformed commit data', () => {
      const malformedData = {
        repoInfo: {
          full_name: 'test/repo',
          description: 'Test repository',
          stargazers_count: 10,
          forks_count: 2,
          open_issues_count: 1,
          watchers_count: 5,
          license: { spdx_id: 'MIT' },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          homepage: null,
          default_branch: 'main',
          size: 1000,
          private: false
        },
        languages: { 'JavaScript': 1000 },
        commits: [
          {}, // Empty commit
          { sha: 'abc123' }, // Missing commit data
          { 
            sha: 'def456',
            commit: {} // Empty commit object
          },
          {
            sha: 'ghi789',
            commit: {
              message: 'Valid commit',
              author: {
                name: 'Test User',
                date: new Date().toISOString()
              }
            }
          }
        ],
        contributors: [],
        issues: [],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(malformedData);
      
      expect(result.commits).toHaveLength(4);
      expect(result.commits[0].author).toBe('Unknown');
      expect(result.commits[3].author).toBe('Test User');
      expect(result.commits[3].message).toBe('Valid commit');
    });

    test('should handle very large numbers', () => {
      const largeData = {
        repoInfo: {
          full_name: 'test/large-repo',
          description: 'A very popular repository',
          stargazers_count: 999999,
          forks_count: 50000,
          open_issues_count: 10000,
          watchers_count: 100000,
          license: { spdx_id: 'Apache-2.0' },
          created_at: '2015-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          homepage: 'https://example.com',
          default_branch: 'master',
          size: 5000000,
          private: false
        },
        languages: {
          'JavaScript': 2000000,
          'TypeScript': 1500000,
          'CSS': 300000,
          'HTML': 200000
        },
        commits: new Array(1000).fill(0).map((_, i) => ({
          sha: `commit${i}`,
          commit: {
            message: `Commit ${i}`,
            author: {
              name: 'Developer',
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
            }
          },
          author: { login: 'dev' }
        })),
        contributors: new Array(100).fill(0).map((_, i) => ({
          login: `user${i}`,
          avatar_url: `https://github.com/user${i}.png`,
          contributions: 100 - i,
          html_url: `https://github.com/user${i}`
        })),
        issues: new Array(1000).fill(0).map((_, i) => ({
          state: i % 3 === 0 ? 'closed' : 'open'
        })),
        releases: new Array(50).fill(0).map((_, i) => ({
          name: `v${i}.0.0`,
          published_at: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
          html_url: `https://github.com/test/large-repo/releases/tag/v${i}.0.0`,
          prerelease: false
        })),
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(largeData);
      
      expect(result.repo.stars).toBe(999999);
      expect(result.stats.popularity.score).toBe(100);
      expect(result.stats.health.score).toBeGreaterThanOrEqual(75);
      expect(result.commits).toHaveLength(1000);
      expect(result.contributors).toHaveLength(100);
      expect(result.issues.total).toBe(1000);
      expect(result.releases).toHaveLength(50);
    });

    test('should calculate correct issue close rate', () => {
      const data = {
        repoInfo: {
          full_name: 'test/repo',
          description: 'Test',
          stargazers_count: 10,
          forks_count: 2,
          open_issues_count: 3,
          watchers_count: 5,
          license: { spdx_id: 'MIT' },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          homepage: null,
          default_branch: 'main',
          size: 1000,
          private: false
        },
        languages: { 'JavaScript': 1000 },
        commits: [],
        contributors: [],
        issues: [
          { state: 'open' },
          { state: 'open' },
          { state: 'open' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' }
        ],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(data);
      
      expect(result.issues.open).toBe(3);
      expect(result.issues.closed).toBe(7);
      expect(result.issues.total).toBe(10);
      expect(result.issues.closeRate).toBe('70.0%');
    });

    test('should handle missing license information', () => {
      const data = {
        repoInfo: {
          full_name: 'test/repo',
          description: 'Test repository',
          stargazers_count: 10,
          forks_count: 2,
          open_issues_count: 1,
          watchers_count: 5,
          license: null,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          homepage: null,
          default_branch: 'main',
          size: 1000,
          private: false
        },
        languages: { 'JavaScript': 1000 },
        commits: [],
        contributors: [],
        issues: [],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(data);
      
      expect(result.repo.license).toBe('None');
    });

    test('should generate insights for different repository types', () => {
      const frontendRepo = {
        repoInfo: {
          full_name: 'test/frontend-app',
          description: 'Modern React application',
          stargazers_count: 150,
          forks_count: 25,
          open_issues_count: 8,
          watchers_count: 75,
          license: { spdx_id: 'MIT' },
          created_at: '2022-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          homepage: 'https://app.example.com',
          default_branch: 'main',
          size: 15000,
          private: false
        },
        languages: {
          'JavaScript': 40000,
          'CSS': 15000,
          'HTML': 5000,
          'TypeScript': 25000
        },
        commits: [
          {
            sha: 'abc123',
            commit: {
              message: 'feat: add user authentication',
              author: {
                name: 'Frontend Dev',
                date: new Date().toISOString()
              }
            },
            author: { login: 'frontend-dev' }
          },
          {
            sha: 'def456',
            commit: {
              message: 'fix: resolve login bug',
              author: {
                name: 'Frontend Dev',
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
              }
            },
            author: { login: 'frontend-dev' }
          },
          {
            sha: 'ghi789',
            commit: {
              message: 'docs: update README',
              author: {
                name: 'Designer',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              }
            },
            author: { login: 'designer' }
          }
        ],
        contributors: [
          {
            login: 'frontend-dev',
            avatar_url: 'https://github.com/frontend-dev.png',
            contributions: 50,
            html_url: 'https://github.com/frontend-dev'
          },
          {
            login: 'designer',
            avatar_url: 'https://github.com/designer.png',
            contributions: 20,
            html_url: 'https://github.com/designer'
          }
        ],
        issues: [
          { state: 'open' },
          { state: 'closed' },
          { state: 'closed' }
        ],
        releases: [
          {
            name: 'v2.1.0',
            published_at: new Date().toISOString(),
            html_url: 'https://github.com/test/frontend-app/releases/tag/v2.1.0',
            prerelease: false
          }
        ],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(frontendRepo);
      
      expect(result.insights.technical.main).toContain('JavaScript');
      expect(result.insights.business.main).toContain('moderately maintained');
      expect(result.insights.general.main).toContain('frontend-app');
      expect(result.stats.activity.commitFrequency).toBe('medium');
    });
  });

  describe('Insight Generation Edge Cases', () => {
    test('should handle repository with no commits', () => {
      const data = {
        repoInfo: {
          full_name: 'test/empty-repo',
          description: 'Empty repository',
          stargazers_count: 1,
          forks_count: 0,
          open_issues_count: 0,
          watchers_count: 1,
          license: { spdx_id: 'MIT' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          homepage: null,
          default_branch: 'main',
          size: 10,
          private: false
        },
        languages: {},
        commits: [],
        contributors: [],
        issues: [],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(data);
      
      expect(result.insights.technical.details).toContain('The repository has 0 recent commits.');
      expect(result.insights.general.main).toContain('empty-repo');
    });

    test('should handle private repository', () => {
      const data = {
        repoInfo: {
          full_name: 'user/private-repo',
          description: 'Private project',
          stargazers_count: 0,
          forks_count: 0,
          open_issues_count: 0,
          watchers_count: 0,
          license: { spdx_id: 'Proprietary' },
          created_at: '2023-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          homepage: null,
          default_branch: 'main',
          size: 5000,
          private: true
        },
        languages: { 'Python': 10000 },
        commits: [
          {
            sha: 'abc123',
            commit: {
              message: 'Initial commit',
              author: {
                name: 'Owner',
                date: new Date().toISOString()
              }
            },
            author: { login: 'owner' }
          }
        ],
        contributors: [
          {
            login: 'owner',
            avatar_url: 'https://github.com/owner.png',
            contributions: 10,
            html_url: 'https://github.com/owner'
          }
        ],
        issues: [],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(data);
      
      expect(result.repo.isPrivate).toBe(true);
      expect(result.insights.general.main).toContain('private repository');
    });

    test('should handle very old repository', () => {
      const data = {
        repoInfo: {
          full_name: 'test/legacy-repo',
          description: 'Legacy codebase',
          stargazers_count: 500,
          forks_count: 100,
          open_issues_count: 50,
          watchers_count: 200,
          license: { spdx_id: 'GPL-2.0' },
          created_at: '2010-01-01T00:00:00Z',
          updated_at: '2015-01-01T00:00:00Z',
          homepage: null,
          default_branch: 'master',
          size: 100000,
          private: false
        },
        languages: {
          'C': 80000,
          'Makefile': 5000,
          'Shell': 3000
        },
        commits: [
          {
            sha: 'old123',
            commit: {
              message: 'Legacy update',
              author: {
                name: 'Maintainer',
                date: '2015-01-01T00:00:00Z'
              }
            },
            author: { login: 'maintainer' }
          }
        ],
        contributors: [
          {
            login: 'maintainer',
            avatar_url: 'https://github.com/maintainer.png',
            contributions: 200,
            html_url: 'https://github.com/maintainer'
          }
        ],
        issues: [
          { state: 'open' },
          { state: 'open' }
        ],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(data);
      
      expect(result.stats.age.years).toBeGreaterThan(10);
      expect(result.insights.general.main).toContain('not been updated recently');
      expect(result.stats.activity.score).toBeLessThan(50);
    });
  });

  describe('Score Calculations', () => {
    test('should calculate correct popularity score for viral repo', () => {
      const viralRepo = {
        repoInfo: {
          full_name: 'facebook/react',
          description: 'A declarative, efficient, and flexible JavaScript library',
          stargazers_count: 200000,
          forks_count: 40000,
          open_issues_count: 800,
          watchers_count: 6000,
          license: { spdx_id: 'MIT' },
          created_at: '2013-05-24T00:00:00Z',
          updated_at: new Date().toISOString(),
          homepage: 'https://reactjs.org',
          default_branch: 'main',
          size: 50000,
          private: false
        },
        languages: { 'JavaScript': 90000, 'TypeScript': 10000 },
        commits: [],
        contributors: [],
        issues: [],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(viralRepo);
      
      expect(result.stats.popularity.score).toBe(100);
    });

    test('should calculate health score for well-maintained repo', () => {
      const wellMaintainedRepo = {
        repoInfo: {
          full_name: 'test/well-maintained',
          description: 'Well maintained project',
          stargazers_count: 1000,
          forks_count: 200,
          open_issues_count: 5,
          watchers_count: 500,
          license: { spdx_id: 'MIT' },
          created_at: '2020-01-01T00:00:00Z',
          updated_at: new Date().toISOString(),
          homepage: 'https://project.example.com',
          default_branch: 'main',
          size: 25000,
          private: false
        },
        languages: { 'TypeScript': 20000, 'JavaScript': 5000 },
        commits: [],
        contributors: new Array(20).fill(0).map((_, i) => ({
          login: `contributor${i}`,
          avatar_url: `https://github.com/contributor${i}.png`,
          contributions: 10,
          html_url: `https://github.com/contributor${i}`
        })),
        issues: [
          { state: 'open' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' },
          { state: 'closed' }
        ],
        releases: [],
        codeFrequency: []
      };

      const result = analyzer.analyzeRepository(wellMaintainedRepo);
      
      expect(result.stats.health.score).toBeGreaterThanOrEqual(80);
      expect(result.stats.health.contributorCount).toBe(20);
    });
  });
});