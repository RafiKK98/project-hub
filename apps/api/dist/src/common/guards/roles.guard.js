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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const role_permissions_map_1 = require("../authorization/role-permissions.map");
const public_decorator_1 = require("../decorators/public.decorator");
const require_permissions_decorator_1 = require("../decorators/require-permissions.decorator");
const roles_decorator_1 = require("../decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [context.getHandler(), context.getClass()]);
        const requiredPermissions = this.reflector.getAllAndOverride(require_permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles?.length && !requiredPermissions?.length)
            return true;
        const request = context
            .switchToHttp()
            .getRequest();
        const user = request.user;
        if (!user)
            throw new common_1.ForbiddenException('No authenticated user found');
        const userRole = user.role;
        if (requiredRoles?.length) {
            const hasRole = requiredRoles.includes(userRole);
            if (!hasRole) {
                throw new common_1.ForbiddenException(`This action requires one of the following roles: ${requiredRoles.join(', ')}`);
            }
        }
        if (requiredPermissions?.length) {
            const missingPermissions = requiredPermissions.filter((permission) => !(0, role_permissions_map_1.roleHasPermission)(userRole, permission));
            if (missingPermissions.length > 0) {
                throw new common_1.ForbiddenException(`Missing required permissions: ${missingPermissions.join(', ')}`);
            }
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map