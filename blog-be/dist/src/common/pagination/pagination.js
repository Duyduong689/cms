"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMeta = buildMeta;
exports.clampPage = clampPage;
exports.clampLimit = clampLimit;
function buildMeta(page, limit, total) {
    return {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
    };
}
function clampPage(page, maxPages) {
    if (maxPages === undefined) {
        return Math.max(1, page);
    }
    return Math.max(1, Math.min(page, maxPages));
}
function clampLimit(limit, min = 1, max = 100) {
    return Math.max(min, Math.min(limit, max));
}
//# sourceMappingURL=pagination.js.map