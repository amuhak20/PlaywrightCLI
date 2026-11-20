# Test Plan: SecureBank Login and Net Worth Verification

## Purpose

Validate that a standard test user can sign in to SecureBank and that the dashboard displays the expected total net worth and account count.

## Application Overview

SecureBank lets a user sign in and review a financial overview on the dashboard. This plan covers signing in with the standard test account and verifying the displayed total net worth.

## Test Scenarios

### 1. Login

**Starting state:** A fresh browser context with no authenticated session. Begin at `https://qaplayground.com/bank/dashboard`; unauthenticated access redirects to the sign-in page.

**Planned test file:** `tests/bank/should-login-successfully.spec.ts`

#### 1.1. should-login-successfully

**Steps:**
  1. Open `https://qaplayground.com/bank/dashboard`.
    - expect: The user is redirected to the SecureBank sign-in page.
    - expect: The sign-in form has Username and Password fields.
  2. Sign in with the `standard_user` test account and its password shown in the page's Test credentials section.
    - expect: The dashboard loads at `/bank/dashboard`.
    - expect: The dashboard identifies the signed-in user as `standard_user`.

### 2. Verify Net Worth

**Starting state:** A separate fresh browser context with no authenticated session. This scenario performs its own login and does not depend on Scenario 1.

**Planned test file:** `tests/bank/should-verify-total-net-worth.spec.ts`

#### 2.1. should-verify-total-net-worth

**Steps:**
  1. Open `https://qaplayground.com/bank/dashboard`.
    - expect: The user is redirected to the SecureBank sign-in page.
  2. Sign in with the `standard_user` test account and its password shown in the page's Test credentials section.
    - expect: The dashboard loads at `/bank/dashboard`.
  3. Check the Total Net Worth summary on the dashboard.
    - expect: The Total Net Worth label is visible.
    - expect: The displayed value is `$17,050.00`.
    - expect: The summary states `Across 2 accounts`.

**Observed on:** 2026-11-18 using playwright-cli.

## Pipeline Context

The [Playwright test pipeline requirements](./Engineering/pipelines.md) apply to this suite. The pipeline runs the tests under `tests` with `npm test` and publishes the HTML report and test-result artifacts.
