// Main application logic
class CodeConcierge {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.currentData = null;
  }

  initializeElements() {
    this.form = document.getElementById('repoForm');
    this.repoInput = document.getElementById('repoInput');
    this.tokenInput = document.getElementById('tokenInput');
    this.analyzeButton = document.getElementById('analyzeButton');
    this.buttonText = this.analyzeButton.querySelector('.button-text');
    this.spinner = this.analyzeButton.querySelector('.spinner');
    this.output = document.getElementById('output');
    this.themeToggle = document.getElementById('themeToggle');
    
    // Tab elements
    this.tabs = document.querySelectorAll('.tabs button');
    this.tabContents = document.querySelectorAll('.tab-content');
    
    // Repository header elements
    this.repoName = document.getElementById('repoName');
    this.repoDescription = document.getElementById('repoDescription');
    this.repoStars = document.getElementById('repoStars');
    this.repoForks = document.getElementById('repoForks');
    this.repoIssues = document.getElementById('repoIssues');
    
    // Score elements
    this.healthScore = document.getElementById('healthScore');
    this.activityScore = document.getElementById('activityScore');
    this.popularityScore = document.getElementById('popularityScore');
    
    // Insight elements
    this.generalInsight = document.getElementById('generalInsight');
    this.generalDetails = document.getElementById('generalDetails');
    this.technicalInsight = document.getElementById('technicalInsight');
    this.technicalDetails = document.getElementById('technicalDetails');
    this.businessInsight = document.getElementById('businessInsight');
    this.businessDetails = document.getElementById('businessDetails');
    
    // Table elements
    this.commitsTable = document.getElementById('commitsTable').querySelector('tbody');
    this.releasesTable = document.getElementById('releasesTable').querySelector('tbody');
  }

  bindEvents() {
    this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    
    // Tab switching
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
    
    // Load theme preference
    this.loadTheme();
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    const repoUrl = this.repoInput.value.trim();
    const token = this.tokenInput.value.trim();
    
    if (!repoUrl) {
      this.showError('Please enter a repository URL or owner/repo format');
      return;
    }
    
    try {
      const { owner, repo } = this.parseRepoUrl(repoUrl);
      await this.analyzeRepository(owner, repo, token);
    } catch (error) {
      this.showError(error.message);
    }
  }

  parseRepoUrl(url) {
    // Handle different URL formats
    const patterns = [
      // GitHub URL: https://github.com/owner/repo
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/,
      // SSH URL: git@github.com:owner/repo.git
      /^git@github\.com:([^\/]+)\/([^\/]+)(?:\.git)?$/,
      // Simple owner/repo format
      /^([^\/]+)\/([^\/]+)$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '')
        };
      }
    }
    
    throw new Error('Invalid repository format. Use owner/repo or GitHub URL');
  }

  async analyzeRepository(owner, repo, token) {
    this.setLoading(true);
    
    try {
      const url = `/api/analyze/${owner}/${repo}${token ? `?token=${token}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      this.currentData = data;
      this.displayResults(data);
      
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  displayResults(data) {
    // Update repository header
    this.repoName.textContent = data.repo.name;
    this.repoDescription.textContent = data.repo.description || 'No description available';
    this.repoStars.textContent = `⭐ ${this.formatNumber(data.repo.stars)}`;
    this.repoForks.textContent = `🍴 ${this.formatNumber(data.repo.forks)}`;
    this.repoIssues.textContent = `🐛 ${data.repo.openIssues}`;
    
    // Update scores
    this.healthScore.textContent = data.stats.health.score;
    this.activityScore.textContent = data.stats.activity.score;
    this.popularityScore.textContent = Math.round(data.stats.popularity.score);
    
    // Update insights
    this.generalInsight.textContent = data.insights.general.main;
    this.updateDetailsList(this.generalDetails, data.insights.general.details);
    
    this.technicalInsight.textContent = data.insights.technical.main;
    this.updateDetailsList(this.technicalDetails, data.insights.technical.details);
    
    this.businessInsight.textContent = data.insights.business.main;
    this.updateDetailsList(this.businessDetails, data.insights.business.details);
    
    // Update tables
    this.updateCommitsTable(data.commits);
    this.updateReleasesTable(data.releases);
    
    // Initialize charts
    if (window.CodeConciergeCharts) {
      window.CodeConciergeCharts.initializeCharts(data);
    }
    
    // Show results
    this.output.hidden = false;
    this.output.scrollIntoView({ behavior: 'smooth' });
  }

  updateDetailsList(element, details) {
    element.innerHTML = '';
    details.forEach(detail => {
      const li = document.createElement('li');
      li.textContent = detail;
      element.appendChild(li);
    });
  }

  updateCommitsTable(commits) {
    this.commitsTable.innerHTML = '';
    commits.slice(0, 10).forEach(commit => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><code>${commit.sha}</code></td>
        <td>${this.escapeHtml(commit.message)}</td>
        <td>${this.escapeHtml(commit.author)}</td>
        <td>${this.formatDate(commit.date)}</td>
      `;
      this.commitsTable.appendChild(row);
    });
  }

  updateReleasesTable(releases) {
    this.releasesTable.innerHTML = '';
    if (releases.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="3" class="text-center text-muted">No releases found</td>';
      this.releasesTable.appendChild(row);
      return;
    }
    
    releases.forEach(release => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${this.escapeHtml(release.name)}</strong></td>
        <td>${this.formatDate(release.date)}</td>
        <td><span class="badge ${release.prerelease ? 'warning' : 'success'}">${release.prerelease ? 'Pre-release' : 'Release'}</span></td>
      `;
      this.releasesTable.appendChild(row);
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    this.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab contents
    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tabName);
    });
  }

  setLoading(loading) {
    this.analyzeButton.disabled = loading;
    this.buttonText.hidden = loading;
    this.spinner.hidden = !loading;
    
    if (loading) {
      this.output.hidden = true;
    }
  }

  showError(message) {
    alert(`Error: ${message}`);
    console.error('Analysis error:', message);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    this.themeToggle.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    
    localStorage.setItem('theme', newTheme);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.themeToggle.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }

  formatNumber(num) {
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

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.codeConcierge = new CodeConcierge();
});