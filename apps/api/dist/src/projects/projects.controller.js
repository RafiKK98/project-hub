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
exports.ProjectsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("../common");
const dto_1 = require("./dto");
const projects_service_1 = require("./projects.service");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    create(orgId, user, dto) {
        return this.projectsService.create(orgId, user.sub, dto);
    }
    findAll(orgId, user) {
        return this.projectsService.findAllForOrg(orgId, user.sub);
    }
    findOne(orgId, projectId, user) {
        return this.projectsService.findById(orgId, projectId, user.sub);
    }
    update(orgId, projectId, user, dto) {
        return this.projectsService.update(orgId, projectId, user.sub, dto);
    }
    delete(orgId, projectId, user) {
        return this.projectsService.delete(orgId, projectId, user.sub);
    }
    getMembers(orgId, projectId, user) {
        return this.projectsService.getMembers(orgId, projectId, user.sub);
    }
    addMember(orgId, projectId, user, dto) {
        return this.projectsService.addMember(orgId, projectId, user.sub, dto);
    }
    updateMemberRole(orgId, projectId, targetUserId, user, dto) {
        return this.projectsService.updateMemberRole(orgId, projectId, user.sub, targetUserId, dto);
    }
    removeMember(orgId, projectId, targetUserId, user) {
        return this.projectsService.removeMember(orgId, projectId, user.sub, targetUserId);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project in an organization' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_2.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all accessible projects in an organization' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a project by ID ' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a project' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_2.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':projectId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a project' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':projectId/members'),
    (0, swagger_1.ApiOperation)({ summary: 'List project members' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)(':projectId/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a member to the project' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_2.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, dto_1.AddProjectMemberDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Patch)(':projectId/members/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a project member role' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('userId')),
    __param(3, (0, common_2.CurrentUser)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, dto_1.UpdateProjectMemberRoleDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Delete)(':projectId/members/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a member from the project' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('userId')),
    __param(3, (0, common_2.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "removeMember", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('organizations/:orgId/projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map