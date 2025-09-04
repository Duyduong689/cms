export declare const USERS_LIST_PREFIX = "users:list";
export declare const USERS_LIST_SET = "users:list:keys";
export declare const USER_BY_ID_PREFIX = "users:byId";
export declare const keyOfList: (hash: string) => string;
export declare const keyOfUser: (id: string) => string;
export declare const generateQueryHash: (query: Record<string, any>) => string;
