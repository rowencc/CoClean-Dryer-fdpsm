Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChildComponents = exports.getCalculatedProps = exports.getChildren = undefined;

var _assign2 = require("lodash/assign");

var _assign3 = _interopRequireDefault(_assign2);

var _defaults2 = require("lodash/defaults");

var _defaults3 = _interopRequireDefault(_defaults2);

var _axis = require("../../helpers/axis");

var _axis2 = _interopRequireDefault(_axis);

var _wrapper = require("../../helpers/wrapper");

var _wrapper2 = _interopRequireDefault(_wrapper);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _victoryCore = require("victory-core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable func-style */
/* eslint-disable no-use-before-define */

function getAxisProps(child, props, calculatedProps) {
  var domain = calculatedProps.domain,
      scale = calculatedProps.scale,
      originSign = calculatedProps.originSign,
      stringMap = calculatedProps.stringMap,
      categories = calculatedProps.categories,
      horizontal = calculatedProps.horizontal;

  var childProps = child.props || {};
  var axis = child.type.getAxis(childProps);
  var currentAxis = _axis2.default.getCurrentAxis(axis, horizontal);
  var otherAxis = axis === "x" ? "y" : "x";
  var axisOffset = getAxisOffset(props, calculatedProps);
  var offsetY = axis === "y" ? undefined : axisOffset.y;
  var offsetX = axis === "x" ? undefined : axisOffset.x;
  var crossAxis = childProps.crossAxis === false ? false : true;
  var orientation = _axis2.default.getOrientation(child, axis, originSign[otherAxis]);
  return {
    stringMap: stringMap[currentAxis],
    categories: categories[currentAxis],
    startAngle: props.startAngle,
    endAngle: props.endAngle,
    innerRadius: props.innerRadius,
    domain: domain,
    scale: scale,
    offsetY: childProps.offsetY !== undefined ? childProps.offsetY : offsetY,
    offsetX: childProps.offsetX !== undefined ? childProps.offsetX : offsetX,
    crossAxis: crossAxis,
    orientation: orientation
  };
}

function getChildProps(child, props, calculatedProps) {
  var axisChild = _axis2.default.findAxisComponents([child]);
  if (axisChild.length > 0) {
    return getAxisProps(axisChild[0], props, calculatedProps);
  }
  var categories = calculatedProps.categories,
      domain = calculatedProps.domain,
      range = calculatedProps.range,
      scale = calculatedProps.scale;

  return { categories: categories, domain: domain, range: range, scale: scale };
}

function getStyles(props) {
  var styleProps = props.style && props.style.parent;
  return {
    parent: (0, _defaults3.default)({}, styleProps, {
      height: "100%",
      width: "100%",
      userSelect: "none"
    }) };
}

function getCalculatedProps(props, childComponents) {
  var style = getStyles(props);
  var horizontal = childComponents.some(function (component) {
    return component.props && component.props.horizontal;
  });
  // TODO: check
  var categories = {
    x: _wrapper2.default.getCategories(props, "x", childComponents),
    y: _wrapper2.default.getCategories(props, "y", childComponents)
  };
  var stringMap = {
    x: createStringMap(props, "x", childComponents),
    y: createStringMap(props, "y", childComponents)
  };
  var axisComponents = {
    x: _axis2.default.getAxisComponent(childComponents, "x"),
    y: _axis2.default.getAxisComponent(childComponents, "y")
  };
  var domain = {
    x: getDomain((0, _assign3.default)({}, props, { categories: categories }), "x", childComponents),
    y: getDomain((0, _assign3.default)({}, props, { categories: categories }), "y", childComponents)
  };
  var range = {
    x: _victoryCore.Helpers.getRange(props, "x"),
    y: _victoryCore.Helpers.getRange(props, "y")
  };
  var baseScale = {
    x: _victoryCore.Scale.getScaleFromProps(props, "x") || axisComponents.x && axisComponents.x.type.getScale(axisComponents.x.props) || _victoryCore.Scale.getDefaultScale(),
    y: _victoryCore.Scale.getScaleFromProps(props, "y") || axisComponents.y && axisComponents.y.type.getScale(axisComponents.y.props) || _victoryCore.Scale.getDefaultScale()
  };
  var scale = {
    x: baseScale.x.domain(domain.x).range(range.x),
    y: baseScale.y.domain(domain.y).range(range.y)
  };

  var origin = props.polar ? _victoryCore.Helpers.getPolarOrigin(props) : _axis2.default.getOrigin(domain);

  var originSign = {
    x: _axis2.default.getOriginSign(origin.x, domain.x),
    y: _axis2.default.getOriginSign(origin.y, domain.y)
  };

  var defaultDomainPadding = getDefaultDomainPadding(childComponents, horizontal);

  var padding = _victoryCore.Helpers.getPadding(props);

  return {
    axisComponents: axisComponents, categories: categories, domain: domain, range: range, horizontal: horizontal, scale: scale, stringMap: stringMap,
    style: style, origin: origin, originSign: originSign, defaultDomainPadding: defaultDomainPadding, padding: padding
  };
}

function getChildren(props, childComponents, calculatedProps) {
  childComponents = childComponents || getChildComponents(props);
  calculatedProps = calculatedProps || getCalculatedProps(props, childComponents);
  var baseStyle = calculatedProps.style.parent;
  var height = props.height,
      polar = props.polar,
      theme = props.theme,
      width = props.width;
  var _calculatedProps = calculatedProps,
      origin = _calculatedProps.origin;

  return childComponents.map(function (child, index) {
    var style = Array.isArray(child.props.style) ? child.props.style : (0, _defaults3.default)({}, child.props.style, { parent: baseStyle });
    var childProps = getChildProps(child, props, calculatedProps);
    var newProps = (0, _defaults3.default)({
      height: height, polar: polar, theme: theme, width: width, style: style,
      origin: polar ? origin : undefined,
      padding: calculatedProps.padding,
      key: index,
      standalone: false
    }, childProps);

    return _react2.default.cloneElement(child, newProps);
  });
}

var getChildComponents = function (props, defaultAxes) {
  var childComponents = _react2.default.Children.toArray(props.children);
  if (childComponents.length === 0) {
    return [defaultAxes.independent, defaultAxes.dependent];
  }

  var axisComponents = {
    dependent: _axis2.default.getAxisComponentsWithParent(childComponents, "dependent"),
    independent: _axis2.default.getAxisComponentsWithParent(childComponents, "independent")
  };

  if (axisComponents.dependent.length === 0 && axisComponents.independent.length === 0) {
    return childComponents.concat([defaultAxes.independent, defaultAxes.dependent]);
  }

  var axisCount = 0;
  return childComponents.filter(function (child) {
    var role = child.type && child.type.role;
    var childProps = child.props || {};
    if (role !== "axis" || childProps.dependentAxis) {
      return true;
    } else if (axisCount < 1) {
      axisCount++;
      return true;
    } else {
      var msg = "Only one independent VictoryAxis component is allowed when " + "using the VictoryChart wrapper. Only the first axis will be used. Please compose " + "multi-axis charts manually";
      _victoryCore.Log.warn(msg);
      return false;
    }
  });
};

var getDefaultDomainPadding = function (childComponents, horizontal) {
  var groupComponent = childComponents.filter(function (child) {
    return child.type && child.type.role && child.type.role === "group-wrapper";
  });

  if (groupComponent.length < 1) {
    return undefined;
  }

  var _groupComponent$0$pro = groupComponent[0].props,
      offset = _groupComponent$0$pro.offset,
      children = _groupComponent$0$pro.children;

  return horizontal ? { y: offset * children.length / 2 } : { x: offset * children.length / 2 };
};

var getDomain = function (props, axis, childComponents) {
  childComponents = childComponents || _react2.default.Children.toArray(props.children);
  var domain = _wrapper2.default.getDomain(props, axis, childComponents);
  var axisComponent = _axis2.default.getAxisComponent(childComponents, axis);
  var invertDomain = axisComponent && axisComponent.props && axisComponent.props.invertAxis;
  return invertDomain ? domain.concat().reverse() : domain;
};

// eslint-disable-next-line complexity
var getAxisOffset = function (props, calculatedProps) {
  var axisComponents = calculatedProps.axisComponents,
      scale = calculatedProps.scale,
      origin = calculatedProps.origin,
      domain = calculatedProps.domain,
      originSign = calculatedProps.originSign,
      padding = calculatedProps.padding;
  var top = padding.top,
      bottom = padding.bottom,
      left = padding.left,
      right = padding.right;
  // make the axes line up, and cross when appropriate

  var axisOrientations = {
    x: _axis2.default.getOrientation(axisComponents.x, "x", originSign.y),
    y: _axis2.default.getOrientation(axisComponents.y, "y", originSign.x)
  };
  var orientationOffset = {
    y: axisOrientations.x === "bottom" ? bottom : top,
    x: axisOrientations.y === "left" ? left : right
  };
  var originOffset = {
    x: axisOrientations.y === "left" ? 0 : props.width,
    y: axisOrientations.x === "bottom" ? props.height : 0
  };
  var originPosition = {
    x: origin.x === domain.x[0] || origin.x === domain.x[1] ? 0 : scale.x(origin.x),
    y: origin.y === domain.y[0] || origin.y === domain.y[1] ? 0 : scale.y(origin.y)
  };
  var calculatedOffset = {
    x: originPosition.x ? Math.abs(originOffset.x - originPosition.x) : orientationOffset.x,
    y: originPosition.y ? Math.abs(originOffset.y - originPosition.y) : orientationOffset.y
  };

  return {
    x: axisComponents.x && axisComponents.x.offsetX !== undefined ? axisComponents.x.offsetX : calculatedOffset.x,
    y: axisComponents.y && axisComponents.y.offsetY !== undefined ? axisComponents.y.offsetY : calculatedOffset.y
  };
};

var createStringMap = function (props, axis, childComponents) {
  var allStrings = _wrapper2.default.getStringsFromChildren(props, axis, childComponents);
  return allStrings.length === 0 ? null : allStrings.reduce(function (memo, string, index) {
    memo[string] = index + 1;
    return memo;
  }, {});
};

exports.getChildren = getChildren;
exports.getCalculatedProps = getCalculatedProps;
exports.getChildComponents = getChildComponents;