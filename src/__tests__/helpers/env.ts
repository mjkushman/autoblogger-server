// Runs before any module loads. Pins the test environment so a test can never
// reach the dev database or use a real API key.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.OPENAI_API_KEY = "sk-test-openai";
process.env.ANTHROPIC_KEY = "sk-ant-test";
process.env.UNSPLASH_CLIENT_ID = "test-unsplash";
process.env.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://localhost:5432/autoblogger_test";

// Tests drop and recreate every table, so refuse anything that isn't a test database.
if (!/_test$/.test(process.env.TEST_DATABASE_URL)) {
  throw new Error("TEST_DATABASE_URL must end in _test. Refusing to run.");
}
