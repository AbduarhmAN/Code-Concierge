// Basic API tests
describe('API Routes', () => {
  test('health endpoint returns success', async () => {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.version).toBe('1.0.0');
  });

  test('analyze endpoint validates repository format', async () => {
    const response = await fetch('http://localhost:3000/api/analyze/invalid');
    const data = await response.json();
    
    expect(response.status).toBe(404);
  });
});

// Basic analyzer tests
describe('Repository Analyzer', () => {
  test('should analyze languages correctly', () => {
    const languages = {
      'JavaScript': 50000,
      'CSS': 20000,
      'HTML': 10000
    };
    
    const result = require('../src/utils/formatter').formatLanguages(languages);
    
    expect(result['JavaScript'].percentage).toBe('62.5');
    expect(result['CSS'].percentage).toBe('25.0');
    expect(result['HTML'].percentage).toBe('12.5');
  });

  test('should calculate commit frequency', () => {
    const commits = [
      { commit: { author: { date: new Date().toISOString() } } },
      { commit: { author: { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() } } }
    ];
    
    const result = require('../src/utils/formatter').calculateCommitFrequency(commits);
    
    expect(['high', 'medium', 'low']).toContain(result);
  });
});