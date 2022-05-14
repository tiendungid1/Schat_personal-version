/* eslint-disable operator-linebreak */

export class TypeUtil {
    /**
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isEmptyObj(obj) {
        return (
            obj &&
            Object.keys(obj).length === 0 &&
            Object.getPrototypeOf(obj) === Object.prototype
        );
    }

    /**
     * @param {Object} obj
     * @param {Array} prop
     * @returns {Array}
     */
    static existsPropertiesInObj(obj, ...props) {
        return props.filter(prop => !(prop in obj));
    }

    /**
     * @param {Map} map
     * @param {String} key
     * @returns {Boolean}
     */
    static existsKeyInMap(map, key) {
        return map.has(key);
    }

    /**
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isNull(obj) {
        return obj === null;
    }

    /**
     * @param {*} val
     * @returns {Boolean}
     */
    static isUndefined(val) {
        return typeof val === 'undefined';
    }

    /**
     * @param {String} str
     * @returns {Boolean}
     */
    static isString(str) {
        return typeof str === 'string';
    }

    /**
     * @param {*} a
     * @param {*} b
     * @returns
     */
    static isEqual(a, b) {
        return a === b;
    }

    /**
     * @param {Array} arr
     * @returns {Boolean}
     */
    static isEmptyArray(arr) {
        return arr.length === 0;
    }

    /**
     * @param {Map} map
     * @returns {Boolean}
     */
    static isEmptyMap(map) {
        return map.size === 0;
    }

    /**
     * @param {Object} obj
     * @param {Array<String>} exclusionKeys
     * @returns {Array<Array>}
     */
    static filterNonStringValueInObj(obj, ...exclusionKeys) {
        const invalidKeys = Object.keys(obj).filter(
            key => typeof obj[key] !== 'string' && key,
        );

        exclusionKeys.forEach(key => {
            if (invalidKeys.includes(key)) {
                invalidKeys.splice(invalidKeys.indexOf(key), 1);
            }
        });

        return invalidKeys.map(key => [key, obj[key]]);
    }

    /**
     * @param {Array} array
     * @returns {Array}
     */
    static filterNonStringValueInArray(array) {
        return array.filter(el => typeof el !== 'string');
    }

    static existsElementInArray(arr, el) {
        return arr.some(x => x === el);
    }
}
