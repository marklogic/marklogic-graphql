// Take from https://dmitripavlutin.com/how-to-compare-objects-in-javascript/
// Under the CC license (https://creativecommons.org/licenses/by/4.0/)
function deepArrayEqual(array1, array2, ignoreKeys) {
    if (array1.length != array2.length) {
        return false;
    }
    for (let i = 0; i<array1.length; i++) {
        const element1 = array1[i];
        let foundMatch = false;
        for (let j = 0; j<array2.length; j++) {
            const element2 = array2[j];
            if (deepEqual(element1, element2, ignoreKeys)) {
                foundMatch = true;
            }
        }
        if (!foundMatch) {
            return false;
        }
    }
    return true;
}

function isArray(object) {
    return Object.prototype.toString.call(object) === "[object ArrayNode]";
}


function deepEqual(object1, object2, ignoreKeys = []) {
    if (isArray(object1) !== isArray(object2)) {
        return false;
    } else if (isArray(object1) && isArray(object2)) {
        return deepArrayEqual(object1, object2, ignoreKeys);
    }
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    if (keys1.length === 0) {
        return JSON.stringify(object1) === JSON.stringify(object2);
    }
    for (const key of keys1) {
        if (ignoreKeys.includes(key)) {
            continue;
        }
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            areObjects && !deepEqual(val1, val2, ignoreKeys) ||
            !areObjects && val1 !== val2
        ) {
            return false;
        }
    }
    return true;
}

function isObject(object) {
    return object != null && typeof object === "object";
}

exports.deepEqual = deepEqual;