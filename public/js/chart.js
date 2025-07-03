// Chart initialization and management
class CodeConciergeCharts {
  constructor() {
    this.charts = {};
    this.colors = {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    };
  }

  initializeCharts(data) {
    this.destroyExistingCharts();
    
    // Initialize all charts with the repository data
    this.createLanguageChart(data.languages);
    this.createCommitChart(data.commits);
    this.createContributorsChart(data.contributors);
    this.createIssuesChart(data.issues);
    this.createTimelineChart(data.repo);
  }

  destroyExistingCharts() {
    // Destroy existing charts to prevent memory leaks
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  createLanguageChart(languages) {
    const ctx = document.getElementById('languageChart');
    if (!ctx) return;

    const languageEntries = Object.entries(languages);
    if (languageEntries.length === 0) {
      this.showNoDataMessage(ctx, 'No language data available');
      return;
    }

    const labels = languageEntries.map(([lang]) => lang);
    const data = languageEntries.map(([, info]) => parseFloat(info.percentage));
    const colors = this.generateColors(labels.length);

    this.charts.language = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    });
  }

  createCommitChart(commits) {
    const ctx = document.getElementById('commitChart');
    if (!ctx) return;

    if (!commits || commits.length === 0) {
      this.showNoDataMessage(ctx, 'No commit data available');
      return;
    }

    // Group commits by date (last 30 days)
    const commitsByDate = this.groupCommitsByDate(commits);
    const labels = Object.keys(commitsByDate).sort();
    const data = labels.map(date => commitsByDate[date]);

    this.charts.commit = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.map(date => this.formatDateShort(date)),
        datasets: [{
          label: 'Commits',
          data,
          borderColor: this.colors.primary,
          backgroundColor: this.colors.primary + '20',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: this.colors.primary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  createContributorsChart(contributors) {
    const ctx = document.getElementById('contributorsChart');
    if (!ctx) return;

    if (!contributors || contributors.length === 0) {
      this.showNoDataMessage(ctx, 'No contributor data available');
      return;
    }

    const topContributors = contributors.slice(0, 10);
    const labels = topContributors.map(c => c.login);
    const data = topContributors.map(c => c.contributions);

    this.charts.contributors = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Contributions',
          data,
          backgroundColor: this.colors.success,
          borderColor: this.colors.success,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  createIssuesChart(issues) {
    const ctx = document.getElementById('issuesChart');
    if (!ctx) return;

    const data = [issues.open, issues.closed];
    const labels = ['Open Issues', 'Closed Issues'];

    this.charts.issues = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [this.colors.warning, this.colors.success],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = issues.total;
                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  createTimelineChart(repo) {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;

    // Create a simple timeline showing repository milestones
    const createdDate = new Date(repo.created);
    const updatedDate = new Date(repo.updated);
    const now = new Date();

    // Generate timeline data points
    const timelineData = this.generateTimelineData(createdDate, updatedDate, now);

    this.charts.timeline = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timelineData.labels,
        datasets: [{
          label: 'Repository Activity',
          data: timelineData.data,
          borderColor: this.colors.info,
          backgroundColor: this.colors.info + '20',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: this.colors.info,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Activity: ${context.parsed.y}%`;
              }
            }
          }
        }
      }
    });
  }

  // Helper methods
  groupCommitsByDate(commits) {
    const commitsByDate = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Initialize with zeros for the last 30 days
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      commitsByDate[dateStr] = 0;
    }

    // Count commits by date
    commits.forEach(commit => {
      const commitDate = new Date(commit.date);
      if (commitDate >= thirtyDaysAgo) {
        const dateStr = commitDate.toISOString().split('T')[0];
        if (commitsByDate[dateStr] !== undefined) {
          commitsByDate[dateStr]++;
        }
      }
    });

    return commitsByDate;
  }

  generateTimelineData(created, updated, now) {
    const labels = [];
    const data = [];
    
    // Create timeline points
    const milestones = [
      { date: created, activity: 10, label: 'Created' },
      { date: new Date((created.getTime() + updated.getTime()) / 2), activity: 50, label: 'Development' },
      { date: updated, activity: 80, label: 'Latest Update' },
      { date: now, activity: 60, label: 'Current' }
    ];

    milestones.forEach(milestone => {
      labels.push(this.formatDateShort(milestone.date.toISOString()));
      data.push(milestone.activity);
    });

    return { labels, data };
  }

  generateColors(count) {
    const baseColors = [
      this.colors.primary,
      this.colors.success,
      this.colors.warning,
      this.colors.error,
      this.colors.info,
      this.colors.secondary
    ];

    const colors = [];
    for (let i = 0; i < count; i++) {
      if (i < baseColors.length) {
        colors.push(baseColors[i]);
      } else {
        // Generate additional colors by varying hue
        const hue = (i * 137.508) % 360; // Golden angle approximation
        colors.push(`hsl(${hue}, 70%, 50%)`);
      }
    }

    return colors;
  }

  formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  showNoDataMessage(ctx, message) {
    const parent = ctx.parentElement;
    parent.innerHTML = `<div class="no-data-message text-center text-muted">${message}</div>`;
  }
}

// Initialize charts globally
window.CodeConciergeCharts = new CodeConciergeCharts();