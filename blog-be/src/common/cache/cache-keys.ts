import { createHash } from 'crypto';

export const USERS_LIST_PREFIX = 'users:list';
export const USERS_LIST_SET = 'users:list:keys';
export const USER_BY_ID_PREFIX = 'users:byId';

export const keyOfList = (hash: string): string => `${USERS_LIST_PREFIX}:${hash}`;

export const keyOfUser = (id: string): string => `${USER_BY_ID_PREFIX}:${id}`;

export const generateQueryHash = (query: Record<string, any>): string => {
  const sortedParams = Object.keys(query)
    .sort()
    .reduce((acc, key) => {
      if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
        acc[key] = query[key];
      }
      return acc;
    }, {} as Record<string, any>);
  
  return createHash('md5')
    .update(JSON.stringify(sortedParams))
    .digest('hex')
    .substring(0, 16);
};
