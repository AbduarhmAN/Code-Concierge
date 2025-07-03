// Utility functions tests
import { parseRepositoryUrl, validateGitHubToken, analyzeCommitMessages } from '../src/utils/parser.js';
import { formatDate, formatNumber } from '../src/utils/formatter.js';

describe('Parser Utilities', () => {
  describe('parseRepositoryUrl', () => {
    test('should parse GitHub HTTPS URL correctly', () => {
      const url = 'https://github.com/owner/repo';
      const result = parseRepositoryUrl(url);
      
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    test('should parse GitHub HTTPS URL with .git extension', () => {
      const url = 'https://github.com/owner/repo.git';
      const result = parseRepositoryUrl(url);
      
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    test('should parse GitHub SSH URL correctly', () => {
      const url = 'git@github.com:owner/repo.git';
      const result = parseRepositoryUrl(url);
      
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    test('should parse simple owner/repo format', () => {
      const url = 'owner/repo';
      const result = parseRepositoryUrl(url);
      
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    test('should handle URLs with additional paths', () => {
      const url = 'https://github.com/owner/repo/tree/main/src';
      const result = parseRepositoryUrl(url);
      
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    test('should throw error for invalid URL format', () => {
      expect(() => parseRepositoryUrl('invalid-url'))
        .toThrow('Invalid repository URL format');
    });

    test('should handle empty or whitespace input', () => {
      expect(() => parseRepositoryUrl(''))
        .toThrow('Invalid repository URL format');
      
      expect(() => parseRepositoryUrl('   '))
        .toThrow('Invalid repository URL format');
    });
  });

  describe('validateGitHubToken', () => {
    test('should validate classic GitHub token format', () => {
      const validToken = 'ghp_' + 'a'.repeat(36);
      expect(validateGitHubToken(validToken)).toBe(true);
    });

    test('should validate fine-grained GitHub token format', () => {
      const validToken = 'github_pat_' + 'a'.repeat(82);
      expect(validateGitHubToken(validToken)).toBe(true);
    });

    test('should validate OAuth tokens', () => {
      const validToken = 'gho_' + 'a'.repeat(36);
      expect(validateGitHubToken(validToken)).toBe(true);
    });

    test('should validate user-to-server tokens', () => {
      const validToken = 'ghu_' + 'a'.repeat(36);
      expect(validateGitHubToken(validToken)).toBe(true);
    });

    test('should validate server-to-server tokens', () => {
      const validToken = 'ghs_' + 'a'.repeat(36);
      expect(validateGitHubToken(validToken)).toBe(true);
    });

    test('should validate refresh tokens', () => {
      const validToken = 'ghr_' + 'a'.repeat(36);
      expect(validateGitHubToken(validToken)).toBe(true);
    });

    test('should reject invalid token formats', () => {
      expect(validateGitHubToken('invalid_token')).toBe(false);
      expect(validateGitHubToken('ghp_short')).toBe(false);
      expect(validateGitHubToken('ghp_' + 'a'.repeat(40))).toBe(false);
      expect(validateGitHubToken('')).toBe(false);
      expect(validateGitHubToken(null)).toBe(false);
      expect(validateGitHubToken(undefined)).toBe(false);
    });
  });

  describe('analyzeCommitMessages', () => {
    test('should analyze conventional commit messages', () => {
      const commits = [
        { commit: { message: 'feat: add new feature' } },
        { commit: { message: 'fix: resolve bug' } },
        { commit: { message: 'docs: update documentation' } },
        { commit: { message: 'feat(auth): add authentication' } }
      ];

      const result = analyzeCommitMessages(commits);
      
      expect(result.types.feat).toBe(2);
      expect(result.types.fix).toBe(1);
      expect(result.types.docs).toBe(1);
      expect(result.patterns).toContain('conventional');
      expect(result.totalCommits).toBe(4);
    });

    test('should analyze non-conventional commit patterns', () => {
      const commits = [
        { commit: { message: 'Add new feature' } },
        { commit: { message: 'Fix critical bug' } },
        { commit: { message: 'Update dependencies' } },
        { commit: { message: 'Merge branch main' } }
      ];

      const result = analyzeCommitMessages(commits);
      
      expect(result.patterns).toContain('feature');
      expect(result.patterns).toContain('bugfix');
      expect(result.patterns).toContain('update');
      expect(result.patterns).toContain('merge');
      expect(result.totalCommits).toBe(4);
    });

    test('should handle mixed commit message styles', () => {
      const commits = [
        { commit: { message: 'feat: add authentication' } },
        { commit: { message: 'Fix broken tests' } },
        { commit: { message: 'Implement new API endpoint' } },
        { commit: { message: 'chore: update packages' } }
      ];

      const result = analyzeCommitMessages(commits);
      
      expect(result.types.feat).toBe(1);
      expect(result.types.chore).toBe(1);
      expect(result.patterns).toContain('conventional');
      expect(result.patterns).toContain('bugfix');
      expect(result.patterns).toContain('feature');
      expect(result.totalCommits).toBe(4);
    });

    test('should handle empty commit array', () => {
      const result = analyzeCommitMessages([]);
      
      expect(result.patterns).toEqual([]);
      expect(result.types).toEqual({});
      expect(result.totalCommits).toBe(0);
    });

    test('should handle null or undefined commits', () => {
      const result1 = analyzeCommitMessages(null);
      const result2 = analyzeCommitMessages(undefined);
      
      expect(result1.patterns).toEqual([]);
      expect(result1.types).toEqual({});
      expect(result1.totalCommits).toBe(0);
      expect(result2.patterns).toEqual([]);
      expect(result2.types).toEqual({});
      expect(result2.totalCommits).toBe(0);
    });

    test('should handle commits with missing message', () => {
      const commits = [
        { commit: {} },
        { commit: { message: null } },
        { commit: { message: 'feat: valid commit' } }
      ];

      const result = analyzeCommitMessages(commits);
      
      expect(result.types.feat).toBe(1);
      expect(result.totalCommits).toBe(3);
    });

    test('should handle multi-line commit messages', () => {
      const commits = [
        { commit: { message: 'feat: add new feature\n\nThis is a detailed description' } },
        { commit: { message: 'fix: resolve issue\n\n- Fixed bug 1\n- Fixed bug 2' } }
      ];

      const result = analyzeCommitMessages(commits);
      
      expect(result.types.feat).toBe(1);
      expect(result.types.fix).toBe(1);
      expect(result.patterns).toContain('conventional');
    });
  });
});

describe('Formatter Utilities', () => {
  describe('formatDate', () => {
    test('should format ISO date string correctly', () => {
      const dateString = '2023-01-15T10:30:00Z';
      const result = formatDate(dateString);
      
      expect(result).toBe('Jan 15, 2023');
    });

    test('should handle different date formats', () => {
      const dateString = '2023-12-25T00:00:00.000Z';
      const result = formatDate(dateString);
      
      expect(result).toBe('Dec 25, 2023');
    });

    test('should handle invalid date string', () => {
      const result = formatDate('invalid-date');
      
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatNumber', () => {
    test('should format numbers with K suffix', () => {
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(10000)).toBe('10.0K');
      expect(formatNumber(999)).toBe('999');
    });

    test('should format numbers with M suffix', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(10000000)).toBe('10.0M');
      expect(formatNumber(999999)).toBe('1000.0K');
    });

    test('should format numbers with B suffix', () => {
      expect(formatNumber(1500000000)).toBe('1.5B');
      expect(formatNumber(10000000000)).toBe('10.0B');
      expect(formatNumber(999999999)).toBe('1000.0M');
    });

    test('should handle small numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(999)).toBe('999');
    });

    test('should handle edge cases', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1000000000)).toBe('1.0B');
    });
  });
});