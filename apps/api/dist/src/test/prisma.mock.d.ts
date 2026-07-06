import { PrismaClient } from '@prisma/client';
import { type DeepMockProxy } from 'jest-mock-extended';
export type MockPrisma = DeepMockProxy<PrismaClient>;
export declare function createPrismaMock(): MockPrisma;
export declare function resetPrismaMock(mock: MockPrisma): void;
//# sourceMappingURL=prisma.mock.d.ts.map