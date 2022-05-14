import { Types } from 'mongoose';

export function toObjectId(str) {
    return Types.ObjectId(str);
}

export function isObjectId(input) {
    return input instanceof Types.ObjectId;
}

export function objectIdToString(objectId) {
    return objectId.toString();
}

/**
 * @param {(Record<string, any> & {_id: import('mongoose').Types.ObjectId}} object
 * @param {string} idToBeCompared
 * @returns
 */
export function compareIdInObject(object, idToBeCompared) {
    return object._id.equals(idToBeCompared);
}
