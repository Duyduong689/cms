"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQueryHash = exports.keyOfUser = exports.keyOfList = exports.USER_BY_ID_PREFIX = exports.USERS_LIST_SET = exports.USERS_LIST_PREFIX = void 0;
const crypto_1 = require("crypto");
exports.USERS_LIST_PREFIX = 'users:list';
exports.USERS_LIST_SET = 'users:list:keys';
exports.USER_BY_ID_PREFIX = 'users:byId';
const keyOfList = (hash) => `${exports.USERS_LIST_PREFIX}:${hash}`;
exports.keyOfList = keyOfList;
const keyOfUser = (id) => `${exports.USER_BY_ID_PREFIX}:${id}`;
exports.keyOfUser = keyOfUser;
const generateQueryHash = (query) => {
    const sortedParams = Object.keys(query)
        .sort()
        .reduce((acc, key) => {
        if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
            acc[key] = query[key];
        }
        return acc;
    }, {});
    return (0, crypto_1.createHash)('md5')
        .update(JSON.stringify(sortedParams))
        .digest('hex')
        .substring(0, 16);
};
exports.generateQueryHash = generateQueryHash;
//# sourceMappingURL=cache-keys.js.map