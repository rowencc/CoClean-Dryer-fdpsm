function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* eslint-disable func-style */
/* eslint-disable no-use-before-define */

function isNonEmptyArray(collection) {
  return Array.isArray(collection) && collection.length > 0;
}

function containsStrings(collection) {
  return Array.isArray(collection) && collection.some(function (value) {
    return typeof value === "string";
  });
}

function containsDates(collection) {
  return Array.isArray(collection) && collection.some(function (value) {
    return value instanceof Date;
  });
}

function containsNumbers(collection) {
  return Array.isArray(collection) && collection.some(function (value) {
    return typeof value === "number";
  });
}

function containsOnlyStrings(collection) {
  return isNonEmptyArray(collection) && collection.every(function (value) {
    return typeof value === "string";
  });
}

function isArrayOfArrays(collection) {
  return isNonEmptyArray(collection) && collection.every(Array.isArray);
}

function removeUndefined(arr) {
  return arr.filter(function (el) {
    return el !== undefined;
  });
}

function getMaxValue(arr) {
  for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  var array = arr.concat(values);
  return containsDates(array) ? new Date(Math.max.apply(Math, _toConsumableArray(array))) : Math.max.apply(Math, _toConsumableArray(array));
}

function getMinValue(arr) {
  for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    values[_key2 - 1] = arguments[_key2];
  }

  var array = arr.concat(values);
  return containsDates(array) ? new Date(Math.min.apply(Math, _toConsumableArray(array))) : Math.min.apply(Math, _toConsumableArray(array));
}

export default {
  containsDates: containsDates,
  containsNumbers: containsNumbers,
  containsOnlyStrings: containsOnlyStrings,
  containsStrings: containsStrings,
  getMaxValue: getMaxValue,
  getMinValue: getMinValue,
  isArrayOfArrays: isArrayOfArrays,
  removeUndefined: removeUndefined
};