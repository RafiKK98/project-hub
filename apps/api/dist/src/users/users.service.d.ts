import { User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByIdOrThrow(id: string): Promise<User>;
    assertEmailAvailable(email: string): Promise<void>;
}
//# sourceMappingURL=users.service.d.ts.map