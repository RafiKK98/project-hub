import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, type DeepMockProxy } from 'jest-mock-extended';

export type MockPrisma = DeepMockProxy<PrismaClient>;

/**
 * Creates a fresh deep mock of PrismaService for each test.
 * Usage:
 *   const prisma = createPrismaMock()
 *   prisma.user.findUnique.mockResolvedValue(mockUser)
 */
export function createPrismaMock(): MockPrisma {
  return mockDeep<PrismaClient>();
}

/**
 * Resets all mock implementations and call counts.
 * Call in beforeEach to ensure test isolation.
 */
export function resetPrismaMock(mock: MockPrisma): void {
  mockReset(mock);
}
