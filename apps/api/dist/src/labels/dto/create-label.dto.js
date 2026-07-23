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
exports.CreateLabelDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateLabelDto {
    name;
    color;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 1, maxLength: 32 }, color: { required: true, type: () => String, pattern: "^#[0-9a-fA-F]{6}$" } };
    }
}
exports.CreateLabelDto = CreateLabelDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bug' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(32),
    __metadata("design:type", String)
], CreateLabelDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#ef4444' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9a-fA-F]{6}$/, {
        message: 'Color must be a valid hex color e.g. #ef4444',
    }),
    __metadata("design:type", String)
], CreateLabelDto.prototype, "color", void 0);
//# sourceMappingURL=create-label.dto.js.map