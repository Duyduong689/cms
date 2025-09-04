export interface PageMeta {
    page: number;
    pages: number;
    total: number;
    limit: number;
}
export interface PageResponse<T> {
    items: T[];
    meta: PageMeta;
}
export declare function buildMeta(page: number, limit: number, total: number): PageMeta;
export declare function clampPage(page: number, maxPages?: number): number;
export declare function clampLimit(limit: number, min?: number, max?: number): number;
