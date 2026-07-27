export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/**
 * Generates a unique user per test run so re-running the suite against the
 * same database never collides with a previous run's leftover data.
 */
export function generateTestUser(): TestUser {
  const id = Math.random().toString(36).slice(2, 10);
  return {
    name: `E2E Tester ${id}`,
    email: `e2e-${id}@example.com`,
    password: "TestPass123!",
  };
}
