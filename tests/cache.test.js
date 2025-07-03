// Cache service tests
import cache from '../src/services/cache.js';

describe('Cache Service', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  afterEach(() => {
    // Clean up after each test
    cache.clear();
  });

  test('should store and retrieve data', () => {
    const key = 'test-key';
    const value = { data: 'test-data' };
    
    cache.put(key, value);
    const retrieved = cache.get(key);
    
    expect(retrieved).toEqual(value);
  });

  test('should return null for non-existent keys', () => {
    const result = cache.get('non-existent-key');
    
    expect(result).toBeNull();
  });

  test('should store data with custom duration', () => {
    const key = 'test-key';
    const value = 'test-value';
    const duration = 100; // 100ms
    
    cache.put(key, value, duration);
    const retrieved = cache.get(key);
    
    expect(retrieved).toBe(value);
  });

  test('should expire data after duration', async () => {
    const key = 'test-key';
    const value = 'test-value';
    const duration = 50; // 50ms
    
    cache.put(key, value, duration);
    
    // Should be available immediately
    expect(cache.get(key)).toBe(value);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should be expired
    expect(cache.get(key)).toBeNull();
  });

  test('should delete specific keys', () => {
    const key1 = 'test-key-1';
    const key2 = 'test-key-2';
    const value1 = 'test-value-1';
    const value2 = 'test-value-2';
    
    cache.put(key1, value1);
    cache.put(key2, value2);
    
    // Both should be available
    expect(cache.get(key1)).toBe(value1);
    expect(cache.get(key2)).toBe(value2);
    
    // Delete one key
    cache.del(key1);
    
    // First should be gone, second should remain
    expect(cache.get(key1)).toBeNull();
    expect(cache.get(key2)).toBe(value2);
  });

  test('should clear all cached data', () => {
    const key1 = 'test-key-1';
    const key2 = 'test-key-2';
    const value1 = 'test-value-1';
    const value2 = 'test-value-2';
    
    cache.put(key1, value1);
    cache.put(key2, value2);
    
    // Both should be available
    expect(cache.get(key1)).toBe(value1);
    expect(cache.get(key2)).toBe(value2);
    
    // Clear all
    cache.clear();
    
    // Both should be gone
    expect(cache.get(key1)).toBeNull();
    expect(cache.get(key2)).toBeNull();
  });

  test('should handle different data types', () => {
    const stringKey = 'string-key';
    const objectKey = 'object-key';
    const arrayKey = 'array-key';
    const numberKey = 'number-key';
    const booleanKey = 'boolean-key';
    
    const stringValue = 'test string';
    const objectValue = { name: 'test', value: 123 };
    const arrayValue = [1, 2, 3, 'test'];
    const numberValue = 42;
    const booleanValue = true;
    
    cache.put(stringKey, stringValue);
    cache.put(objectKey, objectValue);
    cache.put(arrayKey, arrayValue);
    cache.put(numberKey, numberValue);
    cache.put(booleanKey, booleanValue);
    
    expect(cache.get(stringKey)).toBe(stringValue);
    expect(cache.get(objectKey)).toEqual(objectValue);
    expect(cache.get(arrayKey)).toEqual(arrayValue);
    expect(cache.get(numberKey)).toBe(numberValue);
    expect(cache.get(booleanKey)).toBe(booleanValue);
  });

  test('should handle null and undefined values', () => {
    const nullKey = 'null-key';
    const undefinedKey = 'undefined-key';
    
    cache.put(nullKey, null);
    cache.put(undefinedKey, undefined);
    
    expect(cache.get(nullKey)).toBeNull();
    expect(cache.get(undefinedKey)).toBeUndefined();
  });

  test('should overwrite existing keys', () => {
    const key = 'test-key';
    const value1 = 'first-value';
    const value2 = 'second-value';
    
    cache.put(key, value1);
    expect(cache.get(key)).toBe(value1);
    
    cache.put(key, value2);
    expect(cache.get(key)).toBe(value2);
  });

  test('should handle complex nested objects', () => {
    const key = 'complex-key';
    const value = {
      user: {
        name: 'John Doe',
        age: 30,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      },
      data: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ],
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    cache.put(key, value);
    const retrieved = cache.get(key);
    
    expect(retrieved).toEqual(value);
    expect(retrieved.user.name).toBe('John Doe');
    expect(retrieved.data).toHaveLength(2);
    expect(retrieved.metadata.version).toBe('1.0.0');
  });
});