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
exports.CommentsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const comments_service_1 = require("./comments.service");
const dto_1 = require("./dto");
let CommentsController = class CommentsController {
    comments;
    constructor(comments) {
        this.comments = comments;
    }
    create(orgId, projectId, number, user, dto) {
        return this.comments.create(orgId, projectId, number, user.sub, dto);
    }
    findAll(orgId, projectId, number, user) {
        return this.comments.findAllForIssue(orgId, projectId, number, user.sub);
    }
    update(orgId, projectId, number, commentId, user, dto) {
        return this.comments.update(orgId, projectId, number, commentId, user.sub, dto);
    }
    delete(orgId, projectId, number, commentId, user) {
        return this.comments.delete(orgId, projectId, number, commentId, user.sub);
    }
};
exports.CommentsController = CommentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a comment to an issue' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('number', common_1.ParseIntPipe)),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object, dto_1.CreateCommentDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List comments on an issue' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('number', common_1.ParseIntPipe)),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':commentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit your own comment' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('number', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Param)('commentId')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String, Object, dto_1.UpdateCommentDto]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':commentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a comment (author or project manager)' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('number', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Param)('commentId')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String, Object]),
    __metadata("design:returntype", Promise)
], CommentsController.prototype, "delete", null);
exports.CommentsController = CommentsController = __decorate([
    (0, swagger_1.ApiTags)('Comments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('organizations/:orgId/projects/:projectId/issues/:number/comments'),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsController);
//# sourceMappingURL=comments.controller.js.map