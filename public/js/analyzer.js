// Repository analyzer utilities
class RepoAnalyzer {
  static analyzeLanguageComplexity(languages) {
    const complexLanguages = ['C++', 'Rust', 'Assembly', 'Haskell'];
    const modernLanguages = ['TypeScript', 'Go', 'Kotlin', 'Swift'];
    const webLanguages = ['JavaScript', 'HTML', 'CSS', 'PHP'];
    
    const languageNames = Object.keys(languages);
    
    return {
      complexity: languageNames.some(lang => complexLanguages.includes(lang)) ? 'High' : 'Medium',
      isModern: languageNames.some(lang => modernLanguages.includes(lang)),
      isWebProject: languageNames.some(lang => webLanguages.includes(lang)),
      languageCount: languageNames.length
    };
  }

  static calculateProjectMaturity(repo, commits, releases) {
    const ageInDays = Math.floor((new Date() - new Date(repo.created)) / (1000 * 60 * 60 * 24));
    const commitsPerDay = commits.length / Math.min(ageInDays, 30); // Average over last 30 days
    
    let maturityScore = 0;
    
    // Age factor (0-30 points)
    if (ageInDays > 365) maturityScore += 30;
    else if (ageInDays > 180) maturityScore += 20;
    else if (ageInDays > 30) maturityScore += 10;
    
    // Release factor (0-25 points)
    if (releases.length > 10) maturityScore += 25;
    else if (releases.length > 5) maturityScore += 20;
    else if (releases.length > 0) maturityScore += 15;
    
    // Activity factor (0-25 points)
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
      level: maturityScore > 80 ? 'Mature' : maturityScore > 50 ? 'Developing' : 'Early'
    };
  }

  static assessCodeQuality(repo, languages, commits) {
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
  }

  static generateRecommendations(data) {
    const recommendations = [];
    const { repo, stats, languages, issues, releases } = data;
    
    // Activity recommendations
    if (stats.activity.score < 50) {
      recommendations.push({
        type: 'activity',
        priority: 'high',
        title: 'Increase Repository Activity',
        description: 'The repository has low recent activity. Consider regular commits and updates.',
        action: 'Make regular commits and keep the project updated'
      });
    }
    
    // Documentation recommendations
    if (!repo.description || repo.description.length < 20) {
      recommendations.push({
        type: 'documentation',
        priority: 'medium',
        title: 'Improve Repository Description',
        description: 'Add a clear, detailed description to help users understand the project.',
        action: 'Add a comprehensive description in repository settings'
      });
    }
    
    // License recommendations
    if (repo.license === 'None') {
      recommendations.push({
        type: 'legal',
        priority: 'medium',
        title: 'Add a License',
        description: 'Adding a license clarifies how others can use your project.',
        action: 'Choose and add an appropriate open source license'
      });
    }
    
    // Issue management recommendations
    if (issues.open > issues.closed && issues.total > 10) {
      recommendations.push({
        type: 'maintenance',
        priority: 'high',
        title: 'Address Open Issues',
        description: 'High number of open issues may indicate maintenance challenges.',
        action: 'Review and address open issues regularly'
      });
    }
    
    // Release recommendations
    if (releases.length === 0 && repo.stars > 10) {
      recommendations.push({
        type: 'versioning',
        priority: 'medium',
        title: 'Create Releases',
        description: 'Tags and releases help users track stable versions.',
        action: 'Create tagged releases for stable versions'
      });
    }
    
    // Language diversity recommendations
    const langCount = Object.keys(languages).length;
    if (langCount > 8) {
      recommendations.push({
        type: 'architecture',
        priority: 'low',
        title: 'Consider Language Consolidation',
        description: 'Many languages might indicate architectural complexity.',
        action: 'Review if all languages are necessary'
      });
    }
    
    return recommendations;
  }

  static calculateRiskAssessment(data) {
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
}

// Export for use in other modules
window.RepoAnalyzer = RepoAnalyzer;