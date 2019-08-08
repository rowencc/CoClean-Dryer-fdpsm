Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCalculatedProps = exports.getChildren = undefined;

var _assign2 = require("lodash/assign");

var _assign3 = _interopRequireDefault(_assign2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _victoryCore = require("victory-core");

var _wrapper = require("../../helpers/wrapper");

var _wrapper2 = _interopRequireDefault(_wrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /* eslint-disable func-style */
/* eslint-disable no-use-before-define */


var fallbackProps = {
  width: 450,
  height: 300,
  padding: 50,
  offset: 0
};

// eslint-disable-next-line max-statements
function getCalculatedProps(props, childComponents) {
  var role = "group";
  var style = _wrapper2.default.getStyle(props.theme, props.style, role);
  var modifiedProps = _victoryCore.Helpers.modifyProps(props, fallbackProps);
  var offset = modifiedProps.offset,
      colorScale = modifiedProps.colorScale,
      color = modifiedProps.color,
      polar = modifiedProps.polar;

  var horizontal = modifiedProps.horizontal || childComponents.every(function (component) {
    return component.props && component.props.horizontal;
  });
  var categories = {
    x: _wrapper2.default.getCategories(modifiedProps, "x"),
    y: _wrapper2.default.getCategories(modifiedProps, "y")
  };
  var datasets = _wrapper2.default.getDataFromChildren(modifiedProps);
  var domain = {
    x: _wrapper2.default.getDomain((0, _assign3.default)({}, modifiedProps, { categories: categories }), "x", childComponents),
    y: _wrapper2.default.getDomain((0, _assign3.default)({}, modifiedProps, { categories: categories }), "y", childComponents)
  };
  var range = {
    x: _victoryCore.Helpers.getRange(modifiedProps, "x"),
    y: _victoryCore.Helpers.getRange(modifiedProps, "y")
  };
  var baseScale = {
    x: _victoryCore.Scale.getScaleFromProps(modifiedProps, "x") || _victoryCore.Scale.getDefaultScale(),
    y: _victoryCore.Scale.getScaleFromProps(modifiedProps, "y") || _victoryCore.Scale.getDefaultScale()
  };
  var xScale = baseScale.x.domain(domain.x).range(range.x);
  var yScale = baseScale.y.domain(domain.y).range(range.y);
  var scale = {
    x: horizontal ? yScale : xScale,
    y: horizontal ? xScale : yScale
  };

  var origin = polar ? props.origin : _victoryCore.Helpers.getPolarOrigin(modifiedProps);
  var padding = _victoryCore.Helpers.getPadding(props);
  return {
    datasets: datasets, categories: categories, range: range, domain: domain, horizontal: horizontal,
    scale: scale, style: style, colorScale: colorScale, color: color, offset: offset, origin: origin, padding: padding
  };
}

function pixelsToValue(props, axis, calculatedProps) {
  if (!props.offset) {
    return 0;
  }
  var childComponents = _react2.default.Children.toArray(props.children);
  var horizontalChildren = childComponents.some(function (child) {
    return child.props.horizontal;
  });
  var horizontal = props && props.horizontal || horizontalChildren.length > 0;
  var currentAxis = _victoryCore.Helpers.getCurrentAxis(axis, horizontal);
  var domain = calculatedProps.domain[currentAxis];
  var range = calculatedProps.range[currentAxis];
  var domainExtent = Math.max.apply(Math, _toConsumableArray(domain)) - Math.min.apply(Math, _toConsumableArray(domain));
  var rangeExtent = Math.max.apply(Math, _toConsumableArray(range)) - Math.min.apply(Math, _toConsumableArray(range));
  return domainExtent / rangeExtent * props.offset;
}

function getX0(props, calculatedProps, index) {
  var center = (calculatedProps.datasets.length - 1) / 2;
  var totalWidth = pixelsToValue(props, "x", calculatedProps);
  return (index - center) * totalWidth;
}

function getPolarX0(props, calculatedProps, index) {
  var center = (calculatedProps.datasets.length - 1) / 2;
  var width = getAngularWidth(props, calculatedProps);
  return (index - center) * width;
}

function getAngularWidth(props, calculatedProps) {
  var range = calculatedProps.range;

  var angularRange = Math.abs(range.x[1] - range.x[0]);
  var r = Math.max.apply(Math, _toConsumableArray(range.y));
  return props.offset / (2 * Math.PI * r) * angularRange;
}

function getLabels(props, datasets, index) {
  if (!props.labels) {
    return undefined;
  }
  return Math.floor(datasets.length / 2) === index ? props.labels : undefined;
}

function getChildProps(props, calculatedProps) {
  var categories = calculatedProps.categories,
      domain = calculatedProps.domain,
      range = calculatedProps.range,
      scale = calculatedProps.scale,
      horizontal = calculatedProps.horizontal,
      origin = calculatedProps.origin,
      padding = calculatedProps.padding;
  var width = props.width,
      height = props.height,
      theme = props.theme,
      polar = props.polar;

  return {
    height: height, width: width, theme: theme, polar: polar, origin: origin, categories: categories, domain: domain, range: range, scale: scale, horizontal: horizontal, padding: padding,
    standalone: false
  };
}

function getColorScale(props, child) {
  var role = child.type && child.type.role;
  var colorScaleOptions = child.props.colorScale || props.colorScale;
  if (role !== "group" && role !== "stack") {
    return undefined;
  }
  return props.theme && props.theme.group ? colorScaleOptions || props.theme.group.colorScale : colorScaleOptions;
}

function getDataWithOffset(props) {
  var defaultDataset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var offset = arguments[2];

  var dataset = props.data || props.y ? _victoryCore.Data.getData(props) : defaultDataset;
  var xOffset = offset || 0;
  return dataset.map(function (datum) {
    var _x1 = datum._x instanceof Date ? new Date(datum._x.getTime() + xOffset) : datum._x + xOffset;

    return (0, _assign3.default)({}, datum, { _x1: _x1 });
  });
}

function getChildren(props, childComponents, calculatedProps) {
  props = _victoryCore.Helpers.modifyProps(props, fallbackProps, "stack");
  childComponents = childComponents || _react2.default.Children.toArray(props.children);
  calculatedProps = calculatedProps || getCalculatedProps(props, childComponents);
  var _calculatedProps = calculatedProps,
      datasets = _calculatedProps.datasets;
  var _props = props,
      labelComponent = _props.labelComponent,
      polar = _props.polar;

  var childProps = getChildProps(props, calculatedProps);

  return childComponents.map(function (child, index) {
    var role = child.type && child.type.role;
    var xOffset = polar ? getPolarX0(props, calculatedProps, index) : getX0(props, calculatedProps, index);
    var style = role === "voronoi" || role === "tooltip" || role === "label" ? child.props.style : _wrapper2.default.getChildStyle(child, index, calculatedProps);
    var labels = props.labels ? getLabels(props, datasets, index) : child.props.labels;
    return _react2.default.cloneElement(child, (0, _assign3.default)({
      labels: labels, style: style, key: index,
      data: getDataWithOffset(props, datasets[index], xOffset),
      colorScale: getColorScale(props, child),
      labelComponent: labelComponent || child.props.labelComponent,
      xOffset: role === "stack" ? xOffset : undefined
    }, childProps));
  });
}

exports.getChildren = getChildren;
exports.getCalculatedProps = getCalculatedProps;