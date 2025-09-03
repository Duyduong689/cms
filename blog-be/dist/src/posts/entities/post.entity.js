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
exports.Post = void 0;
const swagger_1 = require("@nestjs/swagger");
class Post {
}
exports.Post = Post;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier' }),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Post title' }),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL-friendly slug' }),
    __metadata("design:type", String)
], Post.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Main post content' }),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Short summary of the post' }),
    __metadata("design:type", String)
], Post.prototype, "excerpt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL to cover image' }),
    __metadata("design:type", String)
], Post.prototype, "coverImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID of the author' }),
    __metadata("design:type", String)
], Post.prototype, "authorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of tags', type: [String] }),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Publication status', enum: ['draft', 'published'] }),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SEO title' }),
    __metadata("design:type", String)
], Post.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SEO description' }),
    __metadata("design:type", String)
], Post.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Open Graph image URL' }),
    __metadata("design:type", String)
], Post.prototype, "openGraphImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", String)
], Post.prototype, "updatedAt", void 0);
//# sourceMappingURL=post.entity.js.map