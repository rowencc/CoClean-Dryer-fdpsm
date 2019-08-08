Object.defineProperty(exports, "__esModule", {
  value: true
});

var _without2 = require("lodash/without");

var _without3 = _interopRequireDefault(_without2);

var _includes2 = require("lodash/includes");

var _includes3 = _interopRequireDefault(_includes2);

var _values2 = require("lodash/values");

var _values3 = _interopRequireDefault(_values2);

var _orderBy2 = require("lodash/orderBy");

var _orderBy3 = _interopRequireDefault(_orderBy2);

var _range2 = require("lodash/range");

var _range3 = _interopRequireDefault(_range2);

var _uniq2 = require("lodash/uniq");

var _uniq3 = _interopRequireDefault(_uniq2);

var _invert2 = require("lodash/invert");

var _invert3 = _interopRequireDefault(_invert2);

var _isFunction2 = require("lodash/isFunction");

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _identity2 = require("lodash/identity");

var _identity3 = _interopRequireDefault(_identity2);

var _victoryCore = require("victory-core");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /* eslint-disable func-style */


/**
 * Returns the axis (x or y) of a particular axis component
 * @param {Object} props: the props object.
 * @returns {String} the dimension appropriate for the axis given its props
 */
function getAxis(props) {
  if (props.orientation) {
    var vertical = { top: "x", bottom: "x", left: "y", right: "y" };
    return vertical[props.orientation];
  }
  return props.dependentAxis ? "y" : "x";
}

/**
 * Returns the given axis or the opposite axis when horizontal
 * @param {string} axis: the given axis, either "x" pr "y"
 * @param {Boolean} horizontal: true when the chart is flipped to the horizontal orientation
 * @returns {String} the dimension appropriate for the axis given its props "x" or "y"
 */
function getCurrentAxis(axis, horizontal) {
  var otherAxis = axis === "x" ? "y" : "x";
  return horizontal ? otherAxis : axis;
}

/**
 * Returns all axis components that pass a given predicate
 * @param {Array} childComponents: an array of children
 * @param {Function} predicate: a predicate function that will be called with each
 * @returns {Array} all axis components that pass the given predicate or []
 */
function findAxisComponents(childComponents, predicate) {
  predicate = predicate || _identity3.default;
  var findAxes = function (children) {
    return children.reduce(function (memo, child) {
      if (child.type && child.type.role === "axis" && predicate(child)) {
        return memo.concat(child);
      } else if (child.props && child.props.children) {
        return memo.concat(findAxes(_react2.default.Children.toArray(child.props.children)));
      }
      return memo;
    }, []);
  };

  return findAxes(childComponents);
}

/**
 * Returns a single axis component of the desired axis type (x or y)
 * @param {Array} childComponents: an array of children
 * @param {String} axis: desired axis either "x" or "y".
 * @returns {ReactComponent} an axis component of the desired axis or undefined
 */
function getAxisComponent(childComponents, axis) {
  var matchesAxis = function (component) {
    var type = component.type.getAxis(component.props);
    return type === axis;
  };
  return findAxisComponents(childComponents, matchesAxis)[0];
}

/**
 * Returns all axis components of the desired axis type (x or y) along with any
 * parent components excluding VictoryChart
 * @param {Array} childComponents: an optional array of children.
 * @param {String} type: desired axis either "dependent" or "independent".
 * @returns {ReactComponent} an axis component of the desired type or undefined
 */
function getAxisComponentsWithParent(childComponents, type) {
  var matchesType = function (child) {
    return type === "dependent" ? child.props.dependentAxis : !child.props.dependentAxis;
  };

  var findComponents = function (children) {
    return children.reduce(function (memo, child) {
      if (child.type && child.type.role === "axis" && matchesType(child)) {
        return memo.concat(child);
      } else if (child.props && child.props.children) {
        var childAxis = findComponents(_react2.default.Children.toArray(child.props.children));
        return childAxis.length > 0 ? memo.concat(child) : memo;
      }
      return memo;
    }, []);
  };

  return findComponents(childComponents);
}

function getOrigin(domain) {
  var getSingleOrigin = function (d) {
    var domainMin = Math.min.apply(Math, _toConsumableArray(d));
    var domainMax = Math.max.apply(Math, _toConsumableArray(d));
    return domainMax < 0 ? domainMax : Math.max(0, domainMin);
  };

  return {
    x: _victoryCore.Collection.containsDates(domain.x) ? new Date(Math.min.apply(Math, _toConsumableArray(domain.x))) : getSingleOrigin(domain.x),
    y: _victoryCore.Collection.containsDates(domain.y) ? new Date(Math.min.apply(Math, _toConsumableArray(domain.y))) : getSingleOrigin(domain.y)
  };
}

function getOriginSign(origin, domain) {
  var getSign = function () {
    return origin <= 0 && Math.max.apply(Math, _toConsumableArray(domain)) <= 0 ? "negative" : "positive";
  };
  return _victoryCore.Collection.containsDates(domain) ? "positive" : getSign();
}

/**
 * @param {ReactComponent} component: a victory axis component.
 * @param {String} axis: desired axis either "x" or "y".
 * @param {String} originSign: "positive" or "negative"
 * @returns {String} the orientation of the axis ("top", "bottom", "left", or "right")
 */
function getOrientation(component, axis, originSign) {
  if (component && component.props && component.props.orientation) {
    return component.props.orientation;
  }
  var sign = originSign || "positive";
  var typicalOrientations = {
    positive: { x: "bottom", y: "left" },
    negative: { x: "top", y: "right" }
  };
  var flippedOrientations = {
    positive: { x: "left", y: "bottom" },
    negative: { x: "right", y: "top" }
  };
  if (!component) {
    return typicalOrientations[sign][axis];
  }
  var dependent = component.props.dependentAxis;
  return !dependent && axis === "y" || dependent && axis === "x" ? flippedOrientations[sign][axis] : typicalOrientations[sign][axis];
}

/**
 * @param {Object} props: axis component props
 * @returns {Boolean} true when the axis is vertical
 */
function isVertical(props) {
  var orientation = props.orientation || (props.dependentAxis ? "left" : "bottom");
  var vertical = { top: false, bottom: false, left: true, right: true };
  return vertical[orientation];
}

/**
 * @param {Object} props: axis component props
 * @returns {Boolean} true when tickValues contain strings
 */
function stringTicks(props) {
  return props.tickValues !== undefined && _victoryCore.Collection.containsStrings(props.tickValues);
}

function getDefaultTickFormat(props) {
  var tickValues = props.tickValues,
      stringMap = props.stringMap;

  var fallbackFormat = tickValues && !_victoryCore.Collection.containsDates(tickValues) ? function (x) {
    return x;
  } : undefined;
  if (!stringMap) {
    return stringTicks(props) ? function (x, index) {
      return tickValues[index];
    } : fallbackFormat;
  } else {
    var invertedStringMap = stringMap && (0, _invert3.default)(stringMap);
    var tickValueArray = (0, _orderBy3.default)((0, _values3.default)(stringMap), function (n) {
      return n;
    });
    var dataNames = tickValueArray.map(function (tick) {
      return invertedStringMap[tick];
    });
    // string ticks should have one tick of padding at the beginning
    var dataTicks = [""].concat(_toConsumableArray(dataNames), [""]);
    return function (x) {
      return dataTicks[x];
    };
  }
}

function getTickFormat(props, scale) {
  var tickFormat = props.tickFormat,
      stringMap = props.stringMap;

  if (!tickFormat) {
    var defaultTickFormat = getDefaultTickFormat(props);
    var scaleTickFormat = scale.tickFormat && (0, _isFunction3.default)(scale.tickFormat) ? scale.tickFormat() : function (x) {
      return x;
    };
    return defaultTickFormat || scaleTickFormat;
  } else if (tickFormat && Array.isArray(tickFormat)) {
    return function (x, index) {
      return tickFormat[index];
    };
  } else if (tickFormat && (0, _isFunction3.default)(tickFormat)) {
    var applyStringTicks = function (tick, index, ticks) {
      var invertedStringMap = (0, _invert3.default)(stringMap);
      var stringTickArray = ticks.map(function (t) {
        return invertedStringMap[t];
      });
      return props.tickFormat(invertedStringMap[tick], index, stringTickArray);
    };
    return stringMap ? applyStringTicks : tickFormat;
  } else {
    return function (x) {
      return x;
    };
  }
}

function getStringTicks(props) {
  var stringMap = props.stringMap;

  var axis = getAxis(props);
  var categories = Array.isArray(props.categories) ? props.categories : props.categories && props.categories[axis];
  var ticksFromCategories = categories && _victoryCore.Collection.containsOnlyStrings(categories) ? categories.map(function (tick) {
    return stringMap[tick];
  }) : undefined;
  var ticksFromStringMap = stringMap && (0, _values3.default)(stringMap);
  return ticksFromCategories && ticksFromCategories.length !== 0 ? ticksFromCategories : ticksFromStringMap;
}

function getTickArray(props) {
  var tickValues = props.tickValues,
      tickFormat = props.tickFormat,
      stringMap = props.stringMap;

  var getTicksFromFormat = function () {
    if (!tickFormat || !Array.isArray(tickFormat)) {
      return undefined;
    }
    return _victoryCore.Collection.containsStrings(tickFormat) ? tickFormat.map(function (t, i) {
      return i;
    }) : tickFormat;
  };

  var ticks = tickValues;
  if (stringMap) {
    ticks = getStringTicks(props);
  }
  if (tickValues && _victoryCore.Collection.containsStrings(tickValues)) {
    ticks = stringMap ? tickValues.map(function (tick) {
      return stringMap[tick];
    }) : (0, _range3.default)(1, tickValues.length + 1);
  }
  var tickArray = ticks ? (0, _uniq3.default)(ticks) : getTicksFromFormat(props);
  var filterArray = function (arr) {
    var axis = getAxis(props);
    var domain = props.domain && props.domain[axis] || props.domain;
    return Array.isArray(domain) ? arr.filter(function (t) {
      return t >= Math.min.apply(Math, _toConsumableArray(domain)) && t <= Math.max.apply(Math, _toConsumableArray(domain));
    }) : arr;
  };
  return Array.isArray(tickArray) && tickArray.length ? filterArray(tickArray) : undefined;
}

function downsampleTicks(ticks, tickCount) {
  if (!tickCount || !Array.isArray(ticks) || ticks.length <= tickCount) {
    return ticks;
  }
  var k = Math.floor(ticks.length / tickCount);
  return ticks.filter(function (d, i) {
    return i % k === 0;
  });
}

function getTicks(props, scale, filterZero) {
  var tickCount = props.tickCount;

  var tickValues = getTickArray(props);
  if (tickValues) {
    return downsampleTicks(tickValues, tickCount);
  } else if (scale.ticks && (0, _isFunction3.default)(scale.ticks)) {
    // eslint-disable-next-line no-magic-numbers
    var defaultTickCount = tickCount || 5;
    var scaleTicks = scale.ticks(defaultTickCount);
    var tickArray = Array.isArray(scaleTicks) && scaleTicks.length ? scaleTicks : scale.domain();
    var ticks = downsampleTicks(tickArray, tickCount);
    if (filterZero) {
      var filteredTicks = (0, _includes3.default)(ticks, 0) ? (0, _without3.default)(ticks, 0) : ticks;
      return filteredTicks.length ? filteredTicks : ticks;
    }
    return ticks;
  }
  return scale.domain();
}

/**
 * Returns a domain based tickValues
 * @param {Object} props: the props object
 * @param {String} axis: either x or y
 * @returns {Array} returns a domain from tickValues
 */
//eslint-disable-next-line max-statements
function getDomainFromData(props, axis) {
  var polar = props.polar,
      _props$startAngle = props.startAngle,
      startAngle = _props$startAngle === undefined ? 0 : _props$startAngle,
      _props$endAngle = props.endAngle,
      endAngle = _props$endAngle === undefined ? 360 : _props$endAngle;

  var tickValues = getTickArray(props);
  if (!Array.isArray(tickValues)) {
    return undefined;
  }
  var minDomain = _victoryCore.Domain.getMinFromProps(props, axis);
  var maxDomain = _victoryCore.Domain.getMaxFromProps(props, axis);
  var tickStrings = stringTicks(props);
  var ticks = tickValues.map(function (value) {
    return +value;
  });
  var defaultMin = tickStrings ? 1 : _victoryCore.Collection.getMinValue(ticks);
  var defaultMax = tickStrings ? tickValues.length : _victoryCore.Collection.getMaxValue(ticks);
  var min = minDomain !== undefined ? minDomain : defaultMin;
  var max = maxDomain !== undefined ? maxDomain : defaultMax;
  var initialDomain = _victoryCore.Domain.getDomainFromMinMax(min, max);
  var domain = polar && axis === "x" && Math.abs(startAngle - endAngle) === 360 ? _victoryCore.Domain.getSymmetricDomain(initialDomain, ticks) : initialDomain;
  if (isVertical(props) && !polar) {
    domain.reverse();
  }
  return domain;
}

// exposed for use by VictoryChart
function getDomain(props, axis) {
  var inherentAxis = getAxis(props);
  if (axis && axis !== inherentAxis) {
    return undefined;
  }
  return _victoryCore.Domain.createDomainFunction(getDomainFromData)(props, inherentAxis);
}

exports.default = {
  getTicks: getTicks, getTickFormat: getTickFormat, getAxis: getAxis, getAxisComponent: getAxisComponent, getAxisComponentsWithParent: getAxisComponentsWithParent,
  getOrientation: getOrientation, getCurrentAxis: getCurrentAxis, findAxisComponents: findAxisComponents, getOrigin: getOrigin, getOriginSign: getOriginSign, getDomain: getDomain,
  isVertical: isVertical, stringTicks: stringTicks
};