import { formatLanguages, calculateCommitFrequency } from '../utils/formatter.js';

/**
 * Analyzes a GitHub repository and generates insights
 */
const analyzer = {
  /**
   * Analyze repository data and generate comprehensive report
   * @param {Object} data - Repository data from GitHub API
   * @returns {Object} - Analyzed repository data
   */
  analyzeRepository(data) {
    const { repoInfo, languages, commits, contributors, issues, releases, codeFrequency } = data;
    
    // Process languages data
    const languageData = formatLanguages(languages);
    
    // Process commit data
    const commitsData = commits.map(c => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0],
      author: c.commit.author?.name || c.author?.login || 'Unknown',
      date: c.commit.author?.date || new Date().toISOString()
    }));
    
    // Calculate commit frequency
    const commitFrequency = calculateCommitFrequency(commits);
    
    // Process contributor data
    const contributorsData = contributors.map(c => ({
      login: c.login,
      avatar: c.avatar_url,
      contributions: c.contributions,
      url: c.html_url
    }));
    
    // Calculate issue statistics
    const openIssues = issues.filter(i => i.state === 'open').length;
    const closedIssues = issues.filter(i => i.state === 'closed').length;
    const issueCloseRate = closedIssues > 0 ? (closedIssues / (openIssues + closedIssues) * 100).toFixed(1) : 0;
    
    // Process release data
    const releasesData = releases.map(r => ({
      name: r.name || r.tag_name,
      date: r.published_at,
      url: r.html_url,
      prerelease: r.prerelease
    }));
    
    // Calculate repository age
    const creationDate = new Date(repoInfo.created_at);
    const now = new Date();
    const ageInDays = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));
    const ageInMonths = Math.floor(ageInDays / 30);
    const ageInYears = Math.floor(ageInMonths / 12);
    
    // Calculate activity score (0-100)
    const lastUpdateDate = new Date(repoInfo.updated_at);
    const daysSinceLastUpdate = Math.floor((now - lastUpdateDate) / (1000 * 60 * 60 * 24));
    const activityScore = Math.max(0, 100 - Math.min(100, daysSinceLastUpdate));
    
    // Calculate popularity score (0-100)
    const popularityScore = Math.min(100, Math.log10(repoInfo.stargazers_count + 1) * 25);
    
    // Calculate health score (0-100)
    const issueHealthScore = issueCloseRate > 0 ? Math.min(100, issueCloseRate) : 50;
    const contributorScore = Math.min(100, contributors.length * 10);
    const healthScore = Math.round((activityScore + issueHealthScore + contributorScore) / 3);
    
    return {
      repo: {
        name: repoInfo.full_name,
        description: repoInfo.description,
        url: repoInfo.html_url,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        openIssues: repoInfo.open_issues_count,
        watchers: repoInfo.watchers_count,
        license: repoInfo.license?.spdx_id || 'None',
        created: repoInfo.created_at,
        updated: repoInfo.updated_at,
        homepage: repoInfo.homepage,
        defaultBranch: repoInfo.default_branch,
        size: repoInfo.size,
        isPrivate: repoInfo.private
      },
      stats: {
        age: {
          days: ageInDays,
          months: ageInMonths,
          years: ageInYears,
          display: ageInYears > 0 ? `${ageInYears} years` : ageInMonths > 0 ? `${ageInMonths} months` : `${ageInDays} days`
        },
        activity: {
          score: activityScore,
          daysSinceLastUpdate,
          commitFrequency
        },
        popularity: {
          score: popularityScore,
          stars: repoInfo.stargazers_count,
          forks: repoInfo.forks_count,
          watches: repoInfo.watchers_count
        },
        health: {
          score: healthScore,
          issueCloseRate: `${issueCloseRate}%`,
          contributorCount: contributors.length
        }
      },
      languages: languageData,
      commits: commitsData,
      contributors: contributorsData,
      issues: {
        open: openIssues,
        closed: closedIssues,
        total: openIssues + closedIssues,
        closeRate: `${issueCloseRate}%`
      },
      releases: releasesData,
      insights: {
        technical: this.generateTechnicalInsights(data, languageData, commitFrequency),
        business: this.generateBusinessInsights(repoInfo, contributors, issues, healthScore),
        general: this.generateGeneralInsights(repoInfo, languageData, commits, contributors)
      }
    };
  },
  
  /**
   * Generate technical insights for developers
   */
  generateTechnicalInsights(data, languages, commitFrequency) {
    const { repoInfo, commits } = data;
    
    // Generate main technical insight
    let mainInsight = 'This repository ';
    
    // Language insights
    if (Object.keys(languages).length > 0) {
      const primaryLanguage = Object.keys(languages)[0];
      mainInsight += `primarily uses ${primaryLanguage}`;
      
      if (Object.keys(languages).length > 1) {
        mainInsight += ` with ${Object.keys(languages).length - 1} supporting languages`;
      }
      
      mainInsight += '. ';
    }
    
    // Commit frequency insights
    if (commitFrequency === 'high') {
      mainInsight += 'It shows high development activity with frequent commits. ';
    } else if (commitFrequency === 'medium') {
      mainInsight += 'It shows steady development with regular commits. ';
    } else {
      mainInsight += 'It shows limited recent development activity. ';
    }
    
    // Size insights
    const sizeInMB = repoInfo.size / 1024;
    if (sizeInMB > 100) {
      mainInsight += `The codebase is large (${sizeInMB.toFixed(1)} MB), suggesting a mature project.`;
    } else if (sizeInMB > 10) {
      mainInsight += `The codebase is medium-sized (${sizeInMB.toFixed(1)} MB).`;
    } else {
      mainInsight += `The codebase is relatively small (${sizeInMB.toFixed(1)} MB).`;
    }
    
    return {
      main: mainInsight,
      details: [
        `The repository has ${commits.length} recent commits.`,
        `Main branch is "${repoInfo.default_branch}".`,
        `There are ${Object.keys(languages).length} languages used in this codebase.`
      ]
    };
  },
  
  /**
   * Generate business insights for managers
   */
  generateBusinessInsights(repoInfo, contributors, issues, healthScore) {
    // Generate main business insight
    let mainInsight = '';
    
    if (healthScore > 80) {
      mainInsight = 'This is a healthy, active project with good maintenance practices. ';
    } else if (healthScore > 50) {
      mainInsight = 'This is a moderately maintained project with average activity. ';
    } else {
      mainInsight = 'This project shows signs of limited maintenance and may require attention. ';
    }
    
    // Team size insights
    if (contributors.length > 10) {
      mainInsight += `It has a large team with ${contributors.length} contributors. `;
    } else if (contributors.length > 3) {
      mainInsight += `It has a moderate team with ${contributors.length} contributors. `;
    } else {
      mainInsight += `It has a small team with only ${contributors.length} contributor(s). `;
    }
    
    // Popularity insights
    if (repoInfo.stargazers_count > 1000) {
      mainInsight += `With ${repoInfo.stargazers_count} stars, it has significant community interest.`;
    } else if (repoInfo.stargazers_count > 100) {
      mainInsight += `With ${repoInfo.stargazers_count} stars, it has moderate community interest.`;
    } else {
      mainInsight += `With ${repoInfo.stargazers_count} stars, it has limited community visibility.`;
    }
    
    return {
      main: mainInsight,
      details: [
        `The repository has ${repoInfo.open_issues_count} open issues.`,
        `The project has been active for ${new Date(repoInfo.created_at).toLocaleDateString()} (${Math.floor((new Date() - new Date(repoInfo.created_at)) / (1000 * 60 * 60 * 24 * 30))} months).`,
        `The license is "${repoInfo.license?.spdx_id || 'not specified'}", which ${repoInfo.license ? 'allows commercial use' : 'may restrict usage'}.`
      ]
    };
  },
  
  /**
   * Generate general insights for anyone
   */
  generateGeneralInsights(repoInfo, languages, commits, contributors) {
    // Generate main general insight
    let mainInsight = `${repoInfo.full_name} is a ${repoInfo.private ? 'private' : 'public'} repository`;
    
    if (repoInfo.description) {
      mainInsight += ` that ${repoInfo.description.toLowerCase()}.`;
    } else {
      mainInsight += '.';
    }
    
    // Add activity information
    const lastCommitDate = commits[0]?.commit?.author?.date;
    if (lastCommitDate) {
      const lastCommitDays = Math.floor((new Date() - new Date(lastCommitDate)) / (1000 * 60 * 60 * 24));
      if (lastCommitDays < 7) {
        mainInsight += ' It is actively maintained with updates in the past week.';
      } else if (lastCommitDays < 30) {
        mainInsight += ' It has been updated in the past month.';
      } else if (lastCommitDays < 90) {
        mainInsight += ' It was last updated a few months ago.';
      } else {
        mainInsight += ' It has not been updated recently.';
      }
    }
    
    return {
      main: mainInsight,
      details: [
        repoInfo.homepage ? `Project website: ${repoInfo.homepage}` : 'No project website specified.',
        `Created by ${contributors[0]?.login || 'unknown'} and has ${contributors.length} contributor(s).`,
        `The project has ${repoInfo.forks_count} fork(s) and ${repoInfo.stargazers_count} star(s).`
      ]
    };
  }
};

export default analyzer;