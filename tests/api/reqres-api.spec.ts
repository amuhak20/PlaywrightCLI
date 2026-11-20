import { randomInt, randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

const baseUrl = 'https://reqres.in';

function uniqueValue(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

function uniqueUserId(): number {
  return randomInt(100_000, 1_000_000_000);
}

test.describe('ReqRes public demo API', () => {
  test('lists users with pagination and expected fields', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/users?page=2`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body.page).toBe(2);
    expect(body.per_page).toEqual(expect.any(Number));
    expect(body.total).toEqual(expect.any(Number));
    expect(body.total_pages).toBe(Math.ceil(body.total / body.per_page));
    expect(body.data).toEqual(expect.any(Array));
    expect(body.data.length).toBeGreaterThan(0);

    for (const user of body.data) {
      expect(user.id).toEqual(expect.any(Number));
      expect(user.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
      expect(user.first_name).toEqual(expect.any(String));
      expect(user.last_name).toEqual(expect.any(String));
      expect(new URL(user.avatar).protocol).toBe('https:');
    }

    if (body.support !== undefined) {
      expect(body.support.url).toEqual(expect.any(String));
      expect(body.support.text).toEqual(expect.any(String));
    }
  });

  test('gets an existing user by ID', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/users/2`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body.data.id).toBe(2);
    expect(body.data.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(body.data.first_name).toEqual(expect.any(String));
    expect(body.data.last_name).toEqual(expect.any(String));
    expect(new URL(body.data.avatar).protocol).toBe('https:');
  });

  test('returns not found for a missing user', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/users/23`);

    expect(response.status()).toBe(404);
    expect(response.ok()).toBe(false);
  });

  test('creates a demo user with an independent payload', async ({ request }) => {
    const user = {
      name: uniqueValue('api-test-user'),
      job: uniqueValue('api-test-job'),
    };
    const response = await request.post(`${baseUrl}/api/users`, { data: user });

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body.name).toBe(user.name);
    expect(body.job).toBe(user.job);
    expect(String(body.id)).not.toBe('');
    expect(Number.isNaN(Date.parse(body.createdAt))).toBe(false);
  });

  test('updates a demo user with PUT and PATCH using independent payloads', async ({ request }) => {
    const putUser = {
      name: uniqueValue('api-test-put-user'),
      job: uniqueValue('api-test-put-job'),
    };
    const putResponse = await request.put(`${baseUrl}/api/users/${uniqueUserId()}`, {
      data: putUser,
    });

    expect(putResponse.status()).toBe(200);
    expect(putResponse.headers()['content-type']).toContain('application/json');

    const putBody = await putResponse.json();
    expect(putBody.name).toBe(putUser.name);
    expect(putBody.job).toBe(putUser.job);
    expect(Number.isNaN(Date.parse(putBody.updatedAt))).toBe(false);

    const patchUser = {
      job: uniqueValue('api-test-patch-job'),
    };
    const patchResponse = await request.patch(`${baseUrl}/api/users/${uniqueUserId()}`, {
      data: patchUser,
    });

    expect(patchResponse.status()).toBe(200);
    expect(patchResponse.headers()['content-type']).toContain('application/json');

    const patchBody = await patchResponse.json();
    expect(patchBody.job).toBe(patchUser.job);
    expect(Number.isNaN(Date.parse(patchBody.updatedAt))).toBe(false);
  });

  test('deletes a demo user and returns no content', async ({ request }) => {
    const response = await request.delete(`${baseUrl}/api/users/${uniqueUserId()}`);

    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
  });

  test('lists and gets resources with the expected fields', async ({ request }) => {
    const listResponse = await request.get(`${baseUrl}/api/unknown?page=2`);
    expect(listResponse.status()).toBe(200);
    expect(listResponse.headers()['content-type']).toContain('application/json');

    const listBody = await listResponse.json();
    expect(listBody.page).toBe(2);
    expect(listBody.total_pages).toEqual(expect.any(Number));
    expect(listBody.data).toEqual(expect.any(Array));
    expect(listBody.data.length).toBeGreaterThan(0);

    for (const resource of listBody.data) {
      expect(resource.id).toEqual(expect.any(Number));
      expect(resource.name).toEqual(expect.any(String));
      expect(resource.year).toEqual(expect.any(Number));
      expect(resource.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(resource.pantone_value).toEqual(expect.any(String));
    }

    const detailResponse = await request.get(`${baseUrl}/api/unknown/2`);
    expect(detailResponse.status()).toBe(200);
    expect(detailResponse.headers()['content-type']).toContain('application/json');

    const detailBody = await detailResponse.json();
    expect(detailBody.data.id).toBe(2);
    expect(detailBody.data.name).toEqual(expect.any(String));
    expect(detailBody.data.year).toEqual(expect.any(Number));
    expect(detailBody.data.color).toMatch(/^#[0-9A-F]{6}$/i);
    expect(detailBody.data.pantone_value).toEqual(expect.any(String));
  });

  test('returns not found for a missing resource', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/unknown/23`);

    expect(response.status()).toBe(404);
    expect(response.ok()).toBe(false);
  });

  test('logs in with a documented demo fixture', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/login`, {
      data: { email: 'eve.holt@reqres.in', password: 'cityslicka' },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('rejects login when the password is missing', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/login`, {
      data: { email: 'eve.holt@reqres.in' },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body.error).toEqual(expect.any(String));
    expect(body.token).toBeUndefined();
  });

  test('rejects registration when the password is missing', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/register`, {
      data: { email: 'eve.holt@reqres.in' },
    });

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body.error).toEqual(expect.any(String));
    expect(body.token).toBeUndefined();
  });

  test('registers with a documented demo fixture', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/register`, {
      data: { email: 'eve.holt@reqres.in', password: 'cityslicka' },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(String(body.id)).not.toBe('');
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });
});
