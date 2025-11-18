/**
 * Global test setup for NestJS backend tests
 */

// Increase test timeout for slower tests
jest.setTimeout(30000);

// Mock console.log/error in tests to reduce noise
// Comment out these lines if you need to debug tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
// };

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here
});
