import { test, expect } from '@playwright/test';

test.describe('{{TEST_NAME}} API', () => {
  const baseURL = 'https://api.example.com';

  test('GET /endpoint should return data', async ({ request }) => {
    const response = await request.get(`${baseURL}/endpoint`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('results');
  });

  test('POST /endpoint should create resource', async ({ request }) => {
    const response = await request.post(`${baseURL}/endpoint`, {
      data: { name: 'Test' }
    });

    expect(response.status()).toBe(201);
  });
});
