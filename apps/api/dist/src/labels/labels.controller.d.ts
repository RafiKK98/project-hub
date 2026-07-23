import type { JwtPayload } from "../auth/token.service";
import { LabelDto } from '@projecthub/types';
import { CreateLabelDto, SetIssueLabelsDto, UpdateLabelDto } from './dto';
import { LabelsService } from './labels.service';
export declare class LabelsController {
    private readonly labelsService;
    constructor(labelsService: LabelsService);
    findAll(orgId: string, projectId: string, user: JwtPayload): Promise<LabelDto[]>;
    create(orgId: string, projectId: string, user: JwtPayload, dto: CreateLabelDto): Promise<LabelDto>;
    update(orgId: string, projectId: string, labelId: string, user: JwtPayload, dto: UpdateLabelDto): Promise<LabelDto>;
    delete(orgId: string, projectId: string, labelId: string, user: JwtPayload): Promise<void>;
    getIssueLabels(orgId: string, projectId: string, number: number, user: JwtPayload): Promise<LabelDto[]>;
    setIssueLabels(orgId: string, projectId: string, number: number, user: JwtPayload, dto: SetIssueLabelsDto): Promise<LabelDto[]>;
}
//# sourceMappingURL=labels.controller.d.ts.map