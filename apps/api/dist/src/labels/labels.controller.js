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
exports.LabelsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("../common");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dto_1 = require("./dto");
const labels_service_1 = require("./labels.service");
let LabelsController = class LabelsController {
    labelsService;
    constructor(labelsService) {
        this.labelsService = labelsService;
    }
    findAll(orgId, projectId, user) {
        return this.labelsService.findAllForProject(orgId, projectId, user.sub);
    }
    create(orgId, projectId, user, dto) {
        return this.labelsService.create(orgId, projectId, user.sub, dto);
    }
    update(orgId, projectId, labelId, user, dto) {
        return this.labelsService.update(orgId, projectId, labelId, user.sub, dto);
    }
    delete(orgId, projectId, labelId, user) {
        return this.labelsService.delete(orgId, projectId, labelId, user.sub);
    }
    getIssueLabels(orgId, projectId, number, user) {
        return this.labelsService.getIssueLabels(orgId, projectId, number, user.sub);
    }
    setIssueLabels(orgId, projectId, number, user, dto) {
        return this.labelsService.setIssueLabels(orgId, projectId, number, user.sub, dto);
    }
};
exports.LabelsController = LabelsController;
__decorate([
    (0, common_2.Get)('labels'),
    (0, swagger_1.ApiOperation)({ summary: 'List all labels in a project' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_2.Param)('orgId')),
    __param(1, (0, common_2.Param)('projectId')),
    __param(2, (0, common_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LabelsController.prototype, "findAll", null);
__decorate([
    (0, common_2.Post)('labels'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a label in a project' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_2.Param)('orgId')),
    __param(1, (0, common_2.Param)('projectId')),
    __param(2, (0, common_1.CurrentUser)()),
    __param(3, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, dto_1.CreateLabelDto]),
    __metadata("design:returntype", Promise)
], LabelsController.prototype, "create", null);
__decorate([
    (0, common_2.Patch)('labels/:labelId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a label' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_2.Param)('orgId')),
    __param(1, (0, common_2.Param)('projectId')),
    __param(2, (0, common_2.Param)('labelId')),
    __param(3, (0, common_1.CurrentUser)()),
    __param(4, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, dto_1.UpdateLabelDto]),
    __metadata("design:returntype", Promise)
], LabelsController.prototype, "update", null);
__decorate([
    (0, common_2.Delete)('labels/:labelId'),
    (0, common_2.HttpCode)(common_2.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a label' }),
    openapi.ApiResponse({ status: common_2.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_2.Param)('orgId')),
    __param(1, (0, common_2.Param)('projectId')),
    __param(2, (0, common_2.Param)('labelId')),
    __param(3, (0, common_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], LabelsController.prototype, "delete", null);
__decorate([
    (0, common_2.Get)('issues/:number/labels'),
    (0, swagger_1.ApiOperation)({ summary: 'Get labels on an issue' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_2.Param)('orgId')),
    __param(1, (0, common_2.Param)('projectId')),
    __param(2, (0, common_2.Param)('number', common_2.ParseIntPipe)),
    __param(3, (0, common_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], LabelsController.prototype, "getIssueLabels", null);
__decorate([
    (0, common_2.Put)('issues/:number/labels'),
    (0, swagger_1.ApiOperation)({ summary: 'Set labels on an issue (replaces all existing)' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_2.Param)('orgId')),
    __param(1, (0, common_2.Param)('projectId')),
    __param(2, (0, common_2.Param)('number', common_2.ParseIntPipe)),
    __param(3, (0, common_1.CurrentUser)()),
    __param(4, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object, dto_1.SetIssueLabelsDto]),
    __metadata("design:returntype", Promise)
], LabelsController.prototype, "setIssueLabels", null);
exports.LabelsController = LabelsController = __decorate([
    (0, swagger_1.ApiTags)('Labels'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_2.Controller)('organizations/:orgId/projects/:projectId'),
    __metadata("design:paramtypes", [labels_service_1.LabelsService])
], LabelsController);
//# sourceMappingURL=labels.controller.js.map