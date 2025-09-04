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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const query_user_dto_1 = require("./dto/query-user.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    findAll(query) {
        return this.usersService.findAll(query);
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
    toggleStatus(id) {
        return this.usersService.toggleStatus(id);
    }
    resetPassword(id) {
        return this.usersService.resetPassword(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users with pagination and filtering',
        description: 'Retrieve a paginated list of users with optional filtering by role, status, and search query'
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Returns users with pagination metadata',
        schema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                            name: { type: 'string', example: 'John Doe' },
                            email: { type: 'string', example: 'john.doe@example.com' },
                            role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
                            status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
                            avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                meta: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', example: 1 },
                        pages: { type: 'number', example: 5 },
                        total: { type: 'number', example: 47 },
                        limit: { type: 'number', example: 10 }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, description: 'Search term for name or email' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: create_user_dto_1.Role, description: 'Filter by role' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: create_user_dto_1.UserStatus, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_user_dto_1.QueryUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get a user by ID',
        description: 'Retrieve a specific user by their unique identifier'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User details',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
                status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
                avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new user',
        description: 'Create a new user account with the provided information'
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'User created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
                status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
                avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data' }),
    (0, swagger_1.ApiConflictResponse)({ description: 'User with this email already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a user',
        description: 'Update user information. All fields are optional.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User updated successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
                status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
                avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, swagger_1.ApiConflictResponse)({ description: 'User with this email already exists' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Invalid input data' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete a user',
        description: 'Permanently delete a user account. Cannot delete the last admin user.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User deleted successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
                status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'ACTIVE' },
                avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Cannot delete the last admin user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Toggle user status',
        description: 'Toggle user status between ACTIVE and DISABLED. Cannot disable the last admin user.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'User status toggled successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                role: { type: 'string', enum: ['ADMIN', 'STAFF', 'CUSTOMER'], example: 'CUSTOMER' },
                status: { type: 'string', enum: ['ACTIVE', 'DISABLED'], example: 'DISABLED' },
                avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Cannot disable the last admin user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Post)(':id/reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset user password',
        description: 'Generate a new secure password for the user. The new password will be logged in development mode.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Password reset successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true }
            }
        }
    }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "resetPassword", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map