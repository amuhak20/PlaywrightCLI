# Test Plan: ReqRes REST API

## Purpose

Validate the public ReqRes demo API's response codes, JSON contracts, pagination, authentication behavior, and legacy CRUD semantics.

## Application and API Overview

ReqRes provides a shared demo API at `https://reqres.in` and project-backed APIs that use API keys. This plan covers the shared demo endpoints under `/api/`; it does not require creating a project or using private credentials.

The demo API includes paginated users and resources, authentication, and user CRUD routes. Demo writes are echoed in their responses and are not persisted. The shared demo has a low daily request limit, so tests should avoid unnecessary retries and parallel bursts.

**Documentation:** [ReqRes API docs](https://reqres.in/docs), [OpenAPI specification](https://reqres.in/openapi.json), [LLM API guide](https://reqres.in/llm.txt).

## Scope and Setup

- **Base URL:** `https://reqres.in`
- **Content type:** Send `Content-Type: application/json` with JSON request bodies.
- **Authentication:** Use documented demo fixture credentials for `/api/login` and `/api/register`; do not use real credentials. Public demo reads are available without a personal key. If a demo mutation is rejected for missing `x-api-key`, record the behavior and use an explicitly provisioned test key rather than a personal or production key.
- **Test data:** Demo mutation requests are non-persistent; do not assume a created or updated record changes subsequent reads.
- **Rate limits:** Keep requests sequential where practical. On `429`, honor `Retry-After` and avoid aggressive retries.
- **Starting state:** No user-created project or private API key is required.

## Endpoint Coverage

| Area | Endpoint(s) | Coverage |
|---|---|---|
| Users | `GET /api/users`, `GET /api/users/{id}` | List, pagination, valid and missing IDs |
| User mutations | `POST /api/users`, `PUT /api/users/{id}`, `PATCH /api/users/{id}`, `DELETE /api/users/{id}` | Status, response payload, timestamps, empty delete response, non-persistence |
| Resources | `GET /api/unknown`, `GET /api/unknown/{id}` | Paginated resources and valid/missing IDs |
| Authentication | `POST /api/login`, `POST /api/register` | Fixture success and required-field validation |

Project collections (`/api/collections/*`), app-user sessions (`/app/*`), and agent sandbox routes (`/agent/v1/*`) are out of scope. They have separate credentials, data setup, or lifecycle requirements.

## Test Scenarios

### 1. List users and verify pagination

**Endpoint:** `GET /api/users?page=2`

**Steps:**
1. Request page 2.
2. Verify status `200` and a JSON response.
3. Verify `page`, `per_page`, `total`, and `total_pages` are numeric and consistent with the returned `data`.
4. Verify each user contains `id`, `email`, `first_name`, `last_name`, and an absolute `avatar` URL.
5. Verify the response contains the documented support and metadata fields when supplied by the live API.

### 2. Get an existing user

**Endpoint:** `GET /api/users/2`

**Steps:**
1. Request user ID `2`.
2. Verify status `200` and a `data` object.
3. Verify the object has the expected user fields and `id` is `2`.
4. Verify its email and avatar are valid strings.

### 3. Reject a missing user

**Endpoint:** `GET /api/users/23`

**Steps:**
1. Request a user ID outside the documented fixture range.
2. Verify status `404`.
3. Verify the error response is handled as an error and is not mistaken for a valid user payload.

### 4. Create a demo user

**Endpoint:** `POST /api/users`

**Steps:**
1. Submit `{"name":"morpheus","job":"leader"}`.
2. Verify status `201`.
3. Verify the response echoes `name` and `job` and includes an `id` and `createdAt`.
4. Verify tests do not expect the new user to appear in later list or detail requests, because demo writes are not persisted.

### 5. Update a demo user

**Endpoints:** `PUT /api/users/2`, `PATCH /api/users/2`

**Steps:**
1. Send a full update with `PUT`, then a partial update with `PATCH`.
2. Verify status `200` for each.
3. Verify the response echoes the submitted fields and includes `updatedAt`.
4. Verify callers do not interpret the echoed response as persisted server state.

### 6. Delete a demo user

**Endpoint:** `DELETE /api/users/2`

**Steps:**
1. Delete user ID `2`.
2. Verify status `204`.
3. Verify the response has no content.
4. Do not expect a subsequent read to reflect deletion in the shared fixture.

### 7. List and get resources

**Endpoints:** `GET /api/unknown?page=2`, `GET /api/unknown/2`

**Steps:**
1. Request page 2 and verify status `200`, pagination metadata, and resource fields (`id`, `name`, `year`, `color`, `pantone_value`).
2. Request resource ID `2` and verify status `200`, a `data` object, and the matching ID.
3. Verify color values and Pantone values are returned as strings.

### 8. Reject a missing resource

**Endpoint:** `GET /api/unknown/23`

**Steps:**
1. Request a resource ID outside the documented fixture range.
2. Verify status `404` and that no success-shaped resource is returned.

### 9. Log in with a valid demo fixture

**Endpoint:** `POST /api/login`

**Test data:** Use the documented fixture `eve.holt@reqres.in` with its documented demo password `cityslicka`.

**Steps:**
1. Submit the fixture email and password as JSON.
2. Verify status `200`.
3. Verify the response contains a non-empty `token`.
4. Do not log or persist the token outside the test run.

### 10. Reject incomplete authentication requests

**Endpoints:** `POST /api/login`, `POST /api/register`

**Steps:**
1. Send a login request without the required password.
2. Send a registration request without a required field, such as password.
3. Verify each request returns status `400` and a useful error response.
4. Verify no token or successful registration result is returned for invalid input.

### 11. Register with a valid demo fixture

**Endpoint:** `POST /api/register`

**Test data:** Use only documented ReqRes fixture credentials, such as `eve.holt@reqres.in` and `cityslicka`.

**Steps:**
1. Submit the fixture credentials as JSON.
2. Verify status `200`.
3. Verify the response contains the documented registration identifiers/token fields.
4. Treat the response as a demo result; no persistent account is expected.

## Execution Notes

- Validate status code, JSON shape, required fields, and content type for each response.
- Avoid asserting volatile values such as generated IDs, tokens, and timestamps beyond their presence and format.
- Check the current API docs before expanding coverage; ReqRes maintains both the legacy demo API and separately authenticated project APIs.
- Capture unexpected status codes and response bodies in test output, but redact credentials and tokens.

## Pipeline Context

The [Playwright test pipeline requirements](./Engineering/pipelines.md) apply to this suite. The pipeline runs the tests under `tests` with `npm test` and publishes the HTML report and test-result artifacts.

**Observed on:** 2026-11-20. Public list and detail GET routes returned JSON without a personal API key; requesting a missing user returned `404`.
