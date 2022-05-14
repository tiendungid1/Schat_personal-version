import { omit, sortBy, isEqual } from 'lodash';
import { objectIdToString } from 'core/modules/mongoose/utils/objectId.utils';

export class ArrayObjectUtil {
    /**
     * @param {Array<object>} arr
     * @param {string} key
     * @returns {Array} array of object's value
     */
    static mapByKey(arr, key) {
        return arr.map(obj => obj[key]);
    }

    /**
     * @param {Array<object>} arr
     * @param {Array<string>} keys
     * @returns {Array} array of key-removed objects
     */
    static removeByKey(arr, keys) {
        return arr.map(obj => omit(obj, keys));
    }

    /**
     * @param {Array<any>} arr1
     * @param {Array<any>} arr2
     * @returns {Boolean}
     */
    static isSortedArrayEqual(arr1, arr2) {
        return isEqual(sortBy(arr1), sortBy(arr2));
    }

    /**
     * @param {Object} obj
     * @param {Array<String>} props
     * @returns {Array}
     */
    static filterMissingProperties(obj, props) {
        return props.filter(prop => !(prop in obj) && prop);
    }

    /**
     * @param {Arr} arr
     * @returns {Array}
     */
    static filterUndefinedValues(arr) {
        return arr.filter(el => el !== undefined);
    }

    static filterUnwantedValue(arr, value) {
        arr.forEach((el, index) => {
            if (el === value) {
                arr.splice(index, 1);
            }
        });
        return arr;
    }

    static filterElementsInArrOfObj(arr, key, el, fn) {
        const res = [];

        arr.forEach(obj => {
            const s = new Set(obj[key].map(x => objectIdToString(x)));

            if (s.has(el)) {
                res.push(fn(obj));
            }
        });

        return res;
    }

    /**
     * @param {Map} map
     * @returns {Array}
     */
    static arrayFromMap(map) {
        return Array.from(map.values());
    }
}
