import { PrismaService } from "../database/prisma.service";
import { LabelDto } from '@projecthub/types';
import { CreateLabelDto, SetIssueLabelsDto, UpdateLabelDto } from './dto';
export declare class LabelsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllForProject(orgId: string, projectId: string, userId: string): Promise<LabelDto[]>;
    create(orgId: string, projectId: string, userId: string, dto: CreateLabelDto): Promise<LabelDto>;
    update(orgId: string, projectId: string, labelId: string, userId: string, dto: UpdateLabelDto): Promise<LabelDto>;
    delete(orgId: string, projectId: string, labelId: string, userId: string): Promise<void>;
    setIssueLabels(orgId: string, projectId: string, issueNumber: number, userId: string, dto: SetIssueLabelsDto): Promise<LabelDto[]>;
    getIssueLabels(orgId: string, projectId: string, issueNumber: number, userId: string): Promise<LabelDto[]>;
    private assertProjectAccess;
    private assertProjectManager;
    private toDto;
}
//# sourceMappingURL=labels.service.d.ts.map