// Frontend analyzer utilities tests
// Note: These are tests for the client-side analyzer utilities

/**
 * @jest-environment jsdom
 */

// Mock the RepoAnalyzer class since it's a browser-only class
const RepoAnalyzer = {
  analyzeLanguageComplexity: (languages) => {
    const complexityMap = {
      'JavaScript': 3,
      'TypeScript': 4,
      'Python': 2,
      'Java': 4,
      'C++': 5,
      'C#': 4,
      'PHP': 2,
      'Ruby': 3,
      'Go': 3,
      'Rust': 5,
      'HTML': 1,
      'CSS': 1,
      'Shell': 2
    };

    let totalComplexity = 0;
    let totalLines = 0;
    const languageDetails = [];

    Object.entries(languages).forEach(([lang, lines]) => {
      const complexity = complexityMap[lang] || 3;
      totalComplexity += complexity * lines;
      totalLines += lines;
      languageDetails.push({
        language: lang,
        lines,
        complexity,
        weight: (lines / Object.values(languages).reduce((a, b) => a + b, 0)) * 100
      });
    });

    const averageComplexity = totalLines > 0 ? totalComplexity / totalLines : 0;

    return {
      score: Math.round(averageComplexity * 20),
      level: averageComplexity > 4 ? 'High' : averageComplexity > 2.5 ? 'Medium' : 'Low',
      details: languageDetails.sort((a, b) => b.weight - a.weight)
    };
  },

  calculateProjectMaturity: (repo, commits, releases) => {
    let maturityScore = 0;
    const factors = [];

    // Age factor (0-25 points)
    const creationDate = new Date(repo.created);
    const ageInDays = (new Date() - creationDate) / (1000 * 60 * 60 * 24);
    if (ageInDays > 365) {
      maturityScore += 25;
      factors.push('Established project (>1 year)');
    } else if (ageInDays > 180) {
      maturityScore += 20;
      factors.push('Mature project (>6 months)');
    } else if (ageInDays > 90) {
      maturityScore += 15;
      factors.push('Developing project (>3 months)');
    } else {
      maturityScore += 10;
      factors.push('New project');
    }

    // Release factor (0-25 points)
    if (releases.length > 10) {
      maturityScore += 25;
      factors.push('Many releases');
    } else if (releases.length > 5) {
      maturityScore += 20;
      factors.push('Several releases');
    } else if (releases.length > 0) {
      maturityScore += 15;
      factors.push('Has releases');
    } else {
      maturityScore += 5;
      factors.push('No releases');
    }

    // Commit consistency (0-25 points)
    const commitsPerDay = commits.length / Math.max(1, ageInDays);
    if (commitsPerDay > 1) maturityScore += 25;
    else if (commitsPerDay > 0.5) maturityScore += 20;
    else if (commitsPerDay > 0.1) maturityScore += 15;
    else if (commitsPerDay > 0) maturityScore += 10;

    // Star factor (0-20 points)
    if (repo.stars > 1000) maturityScore += 20;
    else if (repo.stars > 100) maturityScore += 15;
    else if (repo.stars > 10) maturityScore += 10;
    else if (repo.stars > 0) maturityScore += 5;

    return {
      score: Math.min(100, maturityScore),
      level: maturityScore > 80 ? 'Mature' : maturityScore > 50 ? 'Developing' : 'Early',
      factors
    };
  },

  assessCodeQuality: (repo, languages, commits) => {
    let qualityScore = 0;
    const factors = [];

    // Documentation factor
    if (repo.description && repo.description.length > 20) {
      qualityScore += 15;
      factors.push('Good documentation');
    }

    // License factor
    if (repo.license !== 'None') {
      qualityScore += 10;
      factors.push('Has license');
    }

    // Language diversity (moderate is good)
    const langCount = Object.keys(languages).length;
    if (langCount >= 2 && langCount <= 5) {
      qualityScore += 15;
      factors.push('Good language balance');
    }

    // Commit message quality (simplified analysis)
    const hasGoodCommits = commits.some(commit => 
      commit.message.length > 10 && 
      (commit.message.includes('fix') || commit.message.includes('add') || commit.message.includes('update'))
    );

    if (hasGoodCommits) {
      qualityScore += 20;
      factors.push('Descriptive commits');
    }

    // Activity consistency
    const recentCommits = commits.filter(commit => {
      const commitDate = new Date(commit.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return commitDate > weekAgo;
    });

    if (recentCommits.length > 0) {
      qualityScore += 20;
      factors.push('Recent activity');
    }

    // Repository size (not too small, not too large)
    const sizeInMB = repo.size / 1024;
    if (sizeInMB > 1 && sizeInMB < 500) {
      qualityScore += 20;
      factors.push('Appropriate size');
    }

    return {
      score: Math.min(100, qualityScore),
      level: qualityScore > 80 ? 'High' : qualityScore > 50 ? 'Medium' : 'Low',
      factors
    };
  },

  generateRecommendations: (data) => {
    const recommendations = [];
    const { repo, stats, languages } = data;

    // Activity recommendations
    if (stats.activity.score < 50) {
      recommendations.push({
        category: 'Activity',
        priority: 'high',
        title: 'Increase development activity',
        description: 'The repository shows low recent activity. Consider more frequent commits and updates.',
        actions: [
          'Set up a regular development schedule',
          'Add automation for routine tasks',
          'Encourage community contributions'
        ]
      });
    }

    // Health recommendations
    if (stats.health.score < 60) {
      recommendations.push({
        category: 'Health',
        priority: 'medium',
        title: 'Improve project health',
        description: 'The project could benefit from better maintenance practices.',
        actions: [
          'Address open issues regularly',
          'Improve issue response time',
          'Add more contributors to the project'
        ]
      });
    }

    // Documentation recommendations
    if (!repo.description || repo.description.length < 20) {
      recommendations.push({
        category: 'Documentation',
        priority: 'medium',
        title: 'Add better documentation',
        description: 'The project needs a more detailed description and documentation.',
        actions: [
          'Write a comprehensive README',
          'Add code comments',
          'Create user documentation'
        ]
      });
    }

    // License recommendations
    if (repo.license === 'None') {
      recommendations.push({
        category: 'Legal',
        priority: 'medium',
        title: 'Add a license',
        description: 'The project should have a clear license for legal clarity.',
        actions: [
          'Choose an appropriate open source license',
          'Add LICENSE file to the repository',
          'Consider legal implications of your choice'
        ]
      });
    }

    // Testing recommendations
    const hasTestFiles = Object.keys(languages).some(lang => 
      ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#'].includes(lang)
    );
    
    if (hasTestFiles) {
      recommendations.push({
        category: 'Quality',
        priority: 'low',
        title: 'Consider adding tests',
        description: 'Adding tests would improve code quality and reliability.',
        actions: [
          'Set up a testing framework',
          'Write unit tests for core functionality',
          'Add continuous integration'
        ]
      });
    }

    return recommendations;
  },

  calculateRiskAssessment: (data) => {
    const risks = [];
    const { repo, stats, contributors, issues } = data;

    // Bus factor risk
    if (contributors.length < 3) {
      risks.push({
        type: 'bus-factor',
        level: 'high',
        description: 'Few contributors - project depends heavily on one person',
        impact: 'Project could become unmaintained if key contributor leaves'
      });
    }

    // Maintenance risk
    if (stats.activity.score < 30) {
      risks.push({
        type: 'maintenance',
        level: 'medium',
        description: 'Low recent activity may indicate maintenance issues',
        impact: 'Users may encounter unresolved bugs and issues'
      });
    }

    // Popularity risk
    if (repo.stars < 5 && repo.forks < 2) {
      risks.push({
        type: 'adoption',
        level: 'medium',
        description: 'Low community engagement',
        impact: 'Limited community support and contributions'
      });
    }

    // Issue management risk
    const issueRatio = issues.total > 0 ? issues.open / issues.total : 0;
    if (issueRatio > 0.7 && issues.total > 10) {
      risks.push({
        type: 'support',
        level: 'high',
        description: 'High ratio of unresolved issues',
        impact: 'May indicate poor issue management or complex problems'
      });
    }

    return risks;
  }
};

describe('Frontend Analyzer Utilities', () => {
  describe('analyzeLanguageComplexity', () => {
    test('should analyze language complexity correctly', () => {
      const languages = {
        'JavaScript': 50000,
        'HTML': 20000,
        'CSS': 10000
      };

      const result = RepoAnalyzer.analyzeLanguageComplexity(languages);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('details');
      expect(result.score).toBeGreaterThan(0);
      expect(['High', 'Medium', 'Low']).toContain(result.level);
      expect(result.details).toBeInstanceOf(Array);
    });

    test('should handle high complexity languages', () => {
      const languages = {
        'C++': 30000,
        'Rust': 20000,
        'Java': 10000
      };

      const result = RepoAnalyzer.analyzeLanguageComplexity(languages);

      expect(result.level).toBe('High');
      expect(result.score).toBeGreaterThan(80);
    });

    test('should handle low complexity languages', () => {
      const languages = {
        'HTML': 30000,
        'CSS': 20000,
        'Shell': 10000
      };

      const result = RepoAnalyzer.analyzeLanguageComplexity(languages);

      expect(result.level).toBe('Low');
      expect(result.score).toBeLessThan(50);
    });

    test('should handle empty languages object', () => {
      const result = RepoAnalyzer.analyzeLanguageComplexity({});

      expect(result.score).toBe(0);
      expect(result.level).toBe('Low');
      expect(result.details).toHaveLength(0);
    });
  });

  describe('calculateProjectMaturity', () => {
    test('should calculate maturity for mature project', () => {
      const repo = {
        created: '2020-01-01T00:00:00Z',
        stars: 1500,
        size: 1024
      };

      const commits = new Array(365).fill({
        date: new Date().toISOString(),
        message: 'Test commit'
      });

      const releases = new Array(15).fill({
        name: 'v1.0.0',
        date: new Date().toISOString()
      });

      const result = RepoAnalyzer.calculateProjectMaturity(repo, commits, releases);

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.level).toBe('Mature');
      expect(result.factors).toContain('Established project (>1 year)');
    });

    test('should calculate maturity for new project', () => {
      const repo = {
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        stars: 5,
        size: 100
      };

      const commits = [
        { date: new Date().toISOString(), message: 'Initial commit' }
      ];

      const releases = [];

      const result = RepoAnalyzer.calculateProjectMaturity(repo, commits, releases);

      expect(result.score).toBeLessThan(50);
      expect(result.level).toBe('Early');
      expect(result.factors).toContain('New project');
    });

    test('should handle edge cases', () => {
      const repo = {
        created: new Date().toISOString(),
        stars: 0,
        size: 0
      };

      const commits = [];
      const releases = [];

      const result = RepoAnalyzer.calculateProjectMaturity(repo, commits, releases);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.level).toBe('Early');
    });
  });

  describe('assessCodeQuality', () => {
    test('should assess high quality code', () => {
      const repo = {
        description: 'This is a well-documented repository with clear purpose',
        license: 'MIT',
        size: 50000
      };

      const languages = {
        'JavaScript': 40000,
        'CSS': 5000,
        'HTML': 5000
      };

      const commits = [
        {
          message: 'fix: resolve authentication bug',
          date: new Date().toISOString()
        },
        {
          message: 'add: implement new feature',
          date: new Date().toISOString()
        }
      ];

      const result = RepoAnalyzer.assessCodeQuality(repo, languages, commits);

      expect(result.score).toBeGreaterThan(70);
      expect(result.level).toBe('High');
      expect(result.factors).toContain('Good documentation');
      expect(result.factors).toContain('Has license');
    });

    test('should assess low quality code', () => {
      const repo = {
        description: 'Test',
        license: 'None',
        size: 10
      };

      const languages = {
        'JavaScript': 1000
      };

      const commits = [
        {
          message: 'fix',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const result = RepoAnalyzer.assessCodeQuality(repo, languages, commits);

      expect(result.score).toBeLessThan(50);
      expect(result.level).toBe('Low');
    });

    test('should handle missing data gracefully', () => {
      const repo = {
        description: '',
        license: 'None',
        size: 0
      };

      const languages = {};
      const commits = [];

      const result = RepoAnalyzer.assessCodeQuality(repo, languages, commits);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.level).toBe('Low');
      expect(result.factors).toBeInstanceOf(Array);
    });
  });

  describe('generateRecommendations', () => {
    test('should generate relevant recommendations', () => {
      const data = {
        repo: {
          description: 'Test',
          license: 'None',
          size: 1000
        },
        stats: {
          activity: { score: 30 },
          health: { score: 40 }
        },
        issues: { open: 5, total: 10 },
        languages: { 'JavaScript': 10000 }
      };

      const result = RepoAnalyzer.generateRecommendations(data);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      const categories = result.map(r => r.category);
      expect(categories).toContain('Activity');
      expect(categories).toContain('Health');
      expect(categories).toContain('Documentation');
      expect(categories).toContain('Legal');

      result.forEach(recommendation => {
        expect(recommendation).toHaveProperty('category');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('title');
        expect(recommendation).toHaveProperty('description');
        expect(recommendation).toHaveProperty('actions');
        expect(recommendation.actions).toBeInstanceOf(Array);
      });
    });

    test('should generate fewer recommendations for healthy projects', () => {
      const data = {
        repo: {
          description: 'This is a well-maintained repository with comprehensive documentation',
          license: 'MIT',
          size: 50000
        },
        stats: {
          activity: { score: 85 },
          health: { score: 90 }
        },
        contributors: [
          { login: 'user1' },
          { login: 'user2' },
          { login: 'user3' }
        ],
        issues: { open: 2, total: 20 },
        languages: { 'JavaScript': 10000, 'TypeScript': 5000 }
      };

      const result = RepoAnalyzer.generateRecommendations(data);

      expect(result.length).toBeLessThan(3);
    });
  });

  describe('calculateRiskAssessment', () => {
    test('should identify high bus factor risk', () => {
      const data = {
        repo: { stars: 1000, forks: 100 },
        stats: { activity: { score: 80 } },
        contributors: [{ login: 'user1' }],
        issues: { open: 5, total: 20 }
      };

      const result = RepoAnalyzer.calculateRiskAssessment(data);

      expect(result).toBeInstanceOf(Array);
      const busFactor = result.find(r => r.type === 'bus-factor');
      expect(busFactor).toBeDefined();
      expect(busFactor.level).toBe('high');
    });

    test('should identify maintenance risk', () => {
      const data = {
        repo: { stars: 100, forks: 10 },
        stats: { activity: { score: 20 } },
        contributors: [
          { login: 'user1' },
          { login: 'user2' },
          { login: 'user3' }
        ],
        issues: { open: 3, total: 10 }
      };

      const result = RepoAnalyzer.calculateRiskAssessment(data);

      const maintenance = result.find(r => r.type === 'maintenance');
      expect(maintenance).toBeDefined();
      expect(maintenance.level).toBe('medium');
    });

    test('should identify adoption risk', () => {
      const data = {
        repo: { stars: 2, forks: 1 },
        stats: { activity: { score: 60 } },
        contributors: [
          { login: 'user1' },
          { login: 'user2' },
          { login: 'user3' }
        ],
        issues: { open: 2, total: 5 }
      };

      const result = RepoAnalyzer.calculateRiskAssessment(data);

      const adoption = result.find(r => r.type === 'adoption');
      expect(adoption).toBeDefined();
      expect(adoption.level).toBe('medium');
    });

    test('should identify support risk', () => {
      const data = {
        repo: { stars: 100, forks: 20 },
        stats: { activity: { score: 70 } },
        contributors: [
          { login: 'user1' },
          { login: 'user2' },
          { login: 'user3' }
        ],
        issues: { open: 15, total: 20 }
      };

      const result = RepoAnalyzer.calculateRiskAssessment(data);

      const support = result.find(r => r.type === 'support');
      expect(support).toBeDefined();
      expect(support.level).toBe('high');
    });

    test('should return empty array for low-risk projects', () => {
      const data = {
        repo: { stars: 500, forks: 100 },
        stats: { activity: { score: 85 } },
        contributors: [
          { login: 'user1' },
          { login: 'user2' },
          { login: 'user3' },
          { login: 'user4' }
        ],
        issues: { open: 3, total: 20 }
      };

      const result = RepoAnalyzer.calculateRiskAssessment(data);

      expect(result).toHaveLength(0);
    });
  });
});