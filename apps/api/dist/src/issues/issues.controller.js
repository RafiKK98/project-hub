"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const dto_1 = require("./dto");
const issues_service_1 = require("./issues.service");
let IssuesController = class IssuesController {
    issuesService;
    constructor(issuesService) {
        this.issuesService = issuesService;
    }
    create(orgId, projectId, user, dto) {
        return this.issuesService.create(orgId, projectId, user.sub, dto);
    }
    findAll(orgId, projectId, user, status, priority, assigneeId) {
        return this.issuesService.findAllForProject(orgId, projectId, user.sub, {
            status: status ? (Array.isArray(status) ? status : [status]) : undefined,
            priority: priority
                ? Array.isArray(priority)
                    ? priority
                    : [priority]
                : undefined,
            assigneeId,
        });
    }
    findOne(orgId, projectId, number, user) {
        return this.issuesService.findByNumber(orgId, projectId, number, user.sub);
    }
    update(orgId, projectId, number, user, dto) {
        return this.issuesService.update(orgId, projectId, number, user.sub, dto);
    }
    reorder(orgId, projectId, number, user, dto) {
        return this.issuesService.reorder(orgId, projectId, number, user.sub, dto);
    }
    delete(orgId, projectId, number, user) {
        return this.issuesService.delete(orgId, projectId, number, user.sub);
    }
};
exports.IssuesController = IssuesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new issue' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, dto_1.CreateIssueDto]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List issues in a project, with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, isArray: true }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, isArray: true }),
    (0, swagger_1.ApiQuery)({ name: 'assigneeId', required: false }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('priority')),
    __param(5, (0, common_1.Query)('assigneeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':number'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an issue by its project-scoped number' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('number', common_1.ParseIntPipe)),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':number'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an issue' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('number', common_1.ParseIntPipe)),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object, dto_1.UpdateIssueDto]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':number/reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder an issue within or across columns' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('number', common_1.ParseIntPipe)),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object, dto_1.ReorderIssueDto]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Delete)(':number'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an issue' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('number', common_1.ParseIntPipe)),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], IssuesController.prototype, "delete", null);
exports.IssuesController = IssuesController = __decorate([
    (0, swagger_1.ApiTags)('Issues'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('organizations/:orgId/projects/:projectId/issues'),
    __metadata("design:paramtypes", [issues_service_1.IssuesService])
], IssuesController);
//# sourceMappingURL=issues.controller.js.map