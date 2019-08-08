Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isEmpty2 = require("lodash/isEmpty");

var _isEmpty3 = _interopRequireDefault(_isEmpty2);

var _orderBy2 = require("lodash/orderBy");

var _orderBy3 = _interopRequireDefault(_orderBy2);

var _property2 = require("lodash/property");

var _property3 = _interopRequireDefault(_property2);

var _isPlainObject2 = require("lodash/isPlainObject");

var _isPlainObject3 = _interopRequireDefault(_isPlainObject2);

var _isFunction2 = require("lodash/isFunction");

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _last2 = require("lodash/last");

var _last3 = _interopRequireDefault(_last2);

var _range2 = require("lodash/range");

var _range3 = _interopRequireDefault(_range2);

var _uniq2 = require("lodash/uniq");

var _uniq3 = _interopRequireDefault(_uniq2);

var _assign2 = require("lodash/assign");

var _assign3 = _interopRequireDefault(_assign2);

var _helpers = require("./helpers");

var _helpers2 = _interopRequireDefault(_helpers);

var _collection = require("./collection");

var _collection2 = _interopRequireDefault(_collection);

var _scale = require("./scale");

var _scale2 = _interopRequireDefault(_scale);

var _immutable = require("./immutable");

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /* eslint-disable func-style */
/* eslint-disable no-use-before-define */


// Private Functions

function parseDatum(datum) {
  var immutableDatumWhitelist = {
    errorX: true,
    errorY: true
  };

  return _immutable2.default.isImmutable(datum) ? _immutable2.default.shallowToJS(datum, immutableDatumWhitelist) : datum;
}

function getLength(data) {
  return _immutable2.default.isIterable(data) ? data.size : data.length;
}

// Returns generated data for a given axis based on domain and sample from props
function generateDataArray(props, axis) {
  var propsDomain = (0, _isPlainObject3.default)(props.domain) ? props.domain[axis] : props.domain;
  var domain = propsDomain || _scale2.default.getBaseScale(props, axis).domain();
  var samples = props.samples || 1;
  var domainMax = Math.max.apply(Math, _toConsumableArray(domain));
  var domainMin = Math.min.apply(Math, _toConsumableArray(domain));
  var step = (domainMax - domainMin) / samples;
  var values = (0, _range3.default)(domainMin, domainMax, step);
  return (0, _last3.default)(values) === domainMax ? values : values.concat(domainMax);
}

// Returns sorted data. If no sort keys are provided, data is returned unaltered.
function sortData(dataset, sortKey) {
  var sortOrder = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "ascending";

  if (!sortKey) {
    return dataset;
  }

  // Ensures previous VictoryLine api for sortKey prop stays consistent
  if (sortKey === "x" || sortKey === "y") {
    sortKey = "_" + sortKey;
  }
  var order = sortOrder === "ascending" ? "asc" : "desc";
  return (0, _orderBy3.default)(dataset, sortKey, order);
}

// This method will remove data points that break certain scales. (log scale only)
function cleanData(dataset, props) {
  var scaleType = {
    x: _scale2.default.getScaleType(props, "x"),
    y: _scale2.default.getScaleType(props, "y")
  };
  if (scaleType.x !== "log" && scaleType.y !== "log") {
    return dataset;
  }
  var rules = function (datum, axis) {
    return scaleType[axis] === "log" ? datum["_" + axis] !== 0 : true;
  };
  return dataset.filter(function (datum) {
    return rules(datum, "x") && rules(datum, "y") && rules(datum, "y0");
  });
}

// Returns a data accessor given an eventKey prop
function getEventKey(key) {
  // creates a data accessor function
  // given a property key, path, array index, or null for identity.
  if ((0, _isFunction3.default)(key)) {
    return key;
  } else if (key === null || key === undefined) {
    return function () {
      return undefined;
    };
  }
  // otherwise, assume it is an array index, property key or path (_.property handles all three)
  return (0, _property3.default)(key);
}

// Returns data with an eventKey prop added to each datum
function addEventKeys(props, data) {
  var eventKeyAccessor = getEventKey(props.eventKey);
  return data.map(function (datum, index) {
    var eventKey = datum.eventKey || eventKeyAccessor(datum) || index;
    return (0, _assign3.default)({ eventKey: eventKey }, datum);
  });
}

// Exported Functions

/**
 * Returns an object mapping string data to numeric data
 * @param {Object} props: the props object
 * @param {String} axis: the current axis
 * @returns {Object} an object mapping string data to numeric data
 */
function createStringMap(props, axis) {
  var stringsFromAxes = getStringsFromAxes(props, axis);
  var stringsFromCategories = getStringsFromCategories(props, axis);
  var stringsFromData = getStringsFromData(props, axis);

  var allStrings = (0, _uniq3.default)([].concat(_toConsumableArray(stringsFromAxes), _toConsumableArray(stringsFromCategories), _toConsumableArray(stringsFromData)));
  return allStrings.length === 0 ? null : allStrings.reduce(function (memo, string, index) {
    memo[string] = index + 1;
    return memo;
  }, {});
}

/**
 * Reduces the size of a data array, such that it is <= maxPoints.
 * @param {Array} data: an array of data; must be sorted
 * @param {Number} maxPoints: maximum number of data points to return
 * @param {Number} startingIndex: the index of the data[0] *in the entire dataset*; this function
                   assumes `data` param is a subset of larger dataset that has been zoommed
  * @returns {Array} an array of data, a subset of data param
  */
function downsample(data, maxPoints) {
  var startingIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  // ensures that the downampling of data while zooming looks good.
  var dataLength = getLength(data);
  if (dataLength > maxPoints) {
    // limit k to powers of 2, e.g. 64, 128, 256
    // so that the same points will be chosen reliably, reducing flicker on zoom
    var k = Math.pow(2, Math.ceil(Math.log2(dataLength / maxPoints)));
    return data.filter(
    // ensure modulo is always calculated from same reference: i + startingIndex
    function (d, i) {
      return (i + startingIndex) % k === 0;
    });
  }
  return data;
}

/**
 * Returns formatted data. Data accessors are applied, and string values are replaced.
 * @param {Array} dataset: the original domain
 * @param {Object} props: the props object
 * @param {Array} expectedKeys: an array of expected data keys
 * @returns {Array} the formatted data
 */
function formatData(dataset, props, expectedKeys) {
  var isArrayOrIterable = Array.isArray(dataset) || _immutable2.default.isIterable(dataset);
  if (!isArrayOrIterable || getLength(dataset) < 1) {
    return [];
  }

  expectedKeys = Array.isArray(expectedKeys) ? expectedKeys : ["x", "y", "y0"];

  var stringMap = {
    x: expectedKeys.indexOf("x") !== -1 ? createStringMap(props, "x") : undefined,
    y: expectedKeys.indexOf("y") !== -1 ? createStringMap(props, "y") : undefined,
    y0: expectedKeys.indexOf("y0") !== -1 ? createStringMap(props, "y") : undefined
  };

  var createAccessor = function (name) {
    return _helpers2.default.createAccessor(props[name] !== undefined ? props[name] : name);
  };

  var accessor = expectedKeys.reduce(function (memo, type) {
    memo[type] = createAccessor(type);
    return memo;
  }, {});

  var data = dataset.reduce(function (dataArr, datum, index) {
    // eslint-disable-line complexity
    datum = parseDatum(datum);
    var fallbackValues = { x: index, y: datum };
    var processedValues = expectedKeys.reduce(function (memo, type) {
      var processedValue = accessor[type](datum);
      var value = processedValue !== undefined ? processedValue : fallbackValues[type];
      if (value !== undefined) {
        if (typeof value === "string" && stringMap[type]) {
          memo[type + "Name"] = value;
          memo["_" + type] = stringMap[type][value];
        } else {
          memo["_" + type] = value;
        }
      }
      return memo;
    }, {});

    var formattedDatum = (0, _assign3.default)({}, processedValues, datum);
    if (!(0, _isEmpty3.default)(formattedDatum)) {
      dataArr.push(formattedDatum);
    }

    return dataArr;
  }, []);

  var sortedData = sortData(data, props.sortKey, props.sortOrder);
  var cleanedData = cleanData(sortedData, props);
  return addEventKeys(props, cleanedData);
}

/**
 * Returns generated x and y data based on domain and sample from props
 * @param {Object} props: the props object
 * @returns {Array} an array of data
 */
function generateData(props) {
  var xValues = generateDataArray(props, "x");
  var yValues = generateDataArray(props, "y");
  var values = xValues.map(function (x, i) {
    return { x: x, y: yValues[i] };
  });
  return values;
}

/**
 * Returns an array of categories for a given axis
 * @param {Object} props: the props object
 * @param {String} axis: the current axis
 * @returns {Array} an array of categories
 */
function getCategories(props, axis) {
  var currentAxis = _helpers2.default.getCurrentAxis(axis, props.horizontal);
  return props.categories && !Array.isArray(props.categories) ? props.categories[currentAxis] : props.categories;
}

/**
 * Returns an array of formatted data
 * @param {Object} props: the props object
 * @returns {Array} an array of data
 */
function getData(props) {
  return props.data ? formatData(props.data, props) : formatData(generateData(props), props);
}

/**
 * Returns an array of strings from axis tickValues for a given axis
 * @param {Object} props: the props object
 * @param {String} axis: the current axis
 * @returns {Array} an array of strings
 */
function getStringsFromAxes(props, axis) {
  var tickValues = props.tickValues,
      tickFormat = props.tickFormat;

  var tickValueArray = void 0;
  if (!tickValues || !Array.isArray(tickValues) && !tickValues[axis]) {
    tickValueArray = tickFormat && Array.isArray(tickFormat) ? tickFormat : [];
  } else {
    tickValueArray = tickValues[axis] || tickValues;
  }
  return tickValueArray.filter(function (val) {
    return typeof val === "string";
  });
}

/**
 * Returns an array of strings from categories for a given axis
 * @param {Object} props: the props object
 * @param {String} axis: the current axis
 * @returns {Array} an array of strings
 */
function getStringsFromCategories(props, axis) {
  if (!props.categories) {
    return [];
  }
  var categories = getCategories(props, axis);
  var categoryStrings = categories && categories.filter(function (val) {
    return typeof val === "string";
  });
  return categoryStrings ? _collection2.default.removeUndefined(categoryStrings) : [];
}

/**
 * Returns an array of strings from data
 * @param {Object} props: the props object
 * @param {String} axis: the current axis
 * @returns {Array} an array of strings
 */
function getStringsFromData(props, axis) {
  var isArrayOrIterable = Array.isArray(props.data) || _immutable2.default.isIterable(props.data);
  if (!isArrayOrIterable) {
    return [];
  }

  var key = props[axis] === undefined ? axis : props[axis];
  var accessor = _helpers2.default.createAccessor(key);

  var dataStrings = props.data.reduce(function (dataArr, datum) {
    datum = parseDatum(datum);
    dataArr.push(accessor(datum));
    return dataArr;
  }, []).filter(function (datum) {
    return typeof datum === "string";
  });

  // return a unique set of strings
  return dataStrings.reduce(function (prev, curr) {
    if (curr !== undefined && curr !== null && prev.indexOf(curr) === -1) {
      prev.push(curr);
    }
    return prev;
  }, []);
}

exports.default = {
  createStringMap: createStringMap,
  downsample: downsample,
  formatData: formatData,
  generateData: generateData,
  getCategories: getCategories,
  getData: getData,
  getStringsFromAxes: getStringsFromAxes,
  getStringsFromCategories: getStringsFromCategories,
  getStringsFromData: getStringsFromData
};