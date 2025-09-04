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

export function buildMeta(page: number, limit: number, total: number): PageMeta {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

export function clampPage(page: number, maxPages?: number): number {
  if (maxPages === undefined) {
    return Math.max(1, page);
  }
  return Math.max(1, Math.min(page, maxPages));
}

export function clampLimit(limit: number, min: number = 1, max: number = 100): number {
  return Math.max(min, Math.min(limit, max));
}
