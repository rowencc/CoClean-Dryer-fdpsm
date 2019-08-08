Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isPlainObject2 = require("lodash/isPlainObject");

var _isPlainObject3 = _interopRequireDefault(_isPlainObject2);

var _values2 = require("lodash/values");

var _values3 = _interopRequireDefault(_values2);

var _groupBy2 = require("lodash/groupBy");

var _groupBy3 = _interopRequireDefault(_groupBy2);

var _some2 = require("lodash/some");

var _some3 = _interopRequireDefault(_some2);

var _uniq2 = require("lodash/uniq");

var _uniq3 = _interopRequireDefault(_uniq2);

var _isFunction2 = require("lodash/isFunction");

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _flatten2 = require("lodash/flatten");

var _flatten3 = _interopRequireDefault(_flatten2);

var _defaults2 = require("lodash/defaults");

var _defaults3 = _interopRequireDefault(_defaults2);

var _assign2 = require("lodash/assign");

var _assign3 = _interopRequireDefault(_assign2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _axis = require("./axis");

var _axis2 = _interopRequireDefault(_axis);

var _victoryCore = require("victory-core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = {
  getData: function (props, childComponents) {
    if (props.data) {
      return _victoryCore.Data.getData(props);
    }
    childComponents = childComponents || _react2.default.Children.toArray(props.children);
    return this.getDataFromChildren(childComponents);
  },
  getDefaultDomainPadding: function (props, axis, childComponents) {
    var horizontalChildren = childComponents.some(function (component) {
      return component.props && component.props.horizontal;
    });
    var horizontal = props && props.horizontal || horizontalChildren;
    var groupComponent = childComponents.filter(function (child) {
      return child.type && child.type.role && child.type.role === "group";
    });

    if (groupComponent.length < 1) {
      return undefined;
    }
    var _groupComponent$0$pro = groupComponent[0].props,
        offset = _groupComponent$0$pro.offset,
        children = _groupComponent$0$pro.children;

    var defaultDomainPadding = horizontal ? { y: offset * children.length / 2 } : { x: offset * children.length / 2 };
    return defaultDomainPadding[axis];
  },
  getDomain: function (props, axis, childComponents) {
    childComponents = childComponents || _react2.default.Children.toArray(props.children);
    var propsDomain = _victoryCore.Domain.getDomainFromProps(props, axis);
    var minDomain = _victoryCore.Domain.getMinFromProps(props, axis);
    var maxDomain = _victoryCore.Domain.getMaxFromProps(props, axis);
    var domainPadding = props.polar ? 0 : this.getDefaultDomainPadding(props, axis, childComponents);
    var domain = void 0;
    if (propsDomain) {
      domain = propsDomain;
    } else {
      var dataset = (props.data || props.y) && _victoryCore.Data.getData(props);
      var dataDomain = dataset ? _victoryCore.Domain.getDomainFromData(props, axis, dataset) : [];
      var childDomain = this.getDomainFromChildren(props, axis, childComponents);
      var min = minDomain || _victoryCore.Collection.getMinValue([].concat(_toConsumableArray(dataDomain), _toConsumableArray(childDomain)));
      var max = maxDomain || _victoryCore.Collection.getMaxValue([].concat(_toConsumableArray(dataDomain), _toConsumableArray(childDomain)));
      domain = _victoryCore.Domain.getDomainFromMinMax(min, max);
    }
    return _victoryCore.Domain.formatDomain(domain, (0, _assign3.default)({ domainPadding: domainPadding }, props), axis);
  },
  setAnimationState: function (props, nextProps) {
    if (!props.animate) {
      return;
    }
    if (props.animate.parentState) {
      var nodesWillExit = props.animate.parentState.nodesWillExit;
      var oldProps = nodesWillExit ? props : null;
      this.setState((0, _defaults3.default)({ oldProps: oldProps, nextProps: nextProps }, props.animate.parentState));
    } else {
      var oldChildren = _react2.default.Children.toArray(props.children);
      var nextChildren = _react2.default.Children.toArray(nextProps.children);
      var isContinuous = function (child) {
        var check = function (c) {
          return c.type && c.type.continuous;
        };
        return Array.isArray(child) ? (0, _some3.default)(child, check) : check(child);
      };

      var continuous = !props.polar && (0, _some3.default)(oldChildren, function (child) {
        return isContinuous(child) || child.props.children && isContinuous(child.props.children);
      });

      var _Transitions$getIniti = _victoryCore.Transitions.getInitialTransitionState(oldChildren, nextChildren),
          _nodesWillExit = _Transitions$getIniti.nodesWillExit,
          nodesWillEnter = _Transitions$getIniti.nodesWillEnter,
          childrenTransitions = _Transitions$getIniti.childrenTransitions,
          nodesShouldEnter = _Transitions$getIniti.nodesShouldEnter;

      this.setState({
        nodesWillExit: _nodesWillExit,
        nodesWillEnter: nodesWillEnter,
        nodesShouldEnter: nodesShouldEnter,
        childrenTransitions: _victoryCore.Collection.isArrayOfArrays(childrenTransitions) ? childrenTransitions[0] : childrenTransitions,
        oldProps: _nodesWillExit ? props : null,
        nextProps: nextProps,
        continuous: continuous
      });
    }
  },
  getAllEvents: function (props) {
    var components = ["groupComponent", "containerComponent", "labelComponent"];
    this.componentEvents = _victoryCore.Events.getComponentEvents(props, components);
    if (Array.isArray(this.componentEvents)) {
      var _componentEvents;

      return Array.isArray(props.events) ? (_componentEvents = this.componentEvents).concat.apply(_componentEvents, _toConsumableArray(props.events)) : this.componentEvents;
    }
    return props.events;
  },
  getAnimationProps: function (props, child, index) {
    var _this = this;

    if (!props.animate) {
      return child.props.animate;
    }
    var getFilteredState = function () {
      var childrenTransitions = _this.state && _this.state.childrenTransitions;
      childrenTransitions = _victoryCore.Collection.isArrayOfArrays(childrenTransitions) ? childrenTransitions[index] : childrenTransitions;
      return (0, _defaults3.default)({ childrenTransitions: childrenTransitions }, _this.state);
    };

    var getTransitions = props.animate && props.animate.getTransitions;
    var state = getFilteredState();
    var parentState = props.animate && props.animate.parentState || state;
    if (!getTransitions) {
      var getTransitionProps = _victoryCore.Transitions.getTransitionPropsFactory(props, state, function (newState) {
        return _this.setState(newState);
      });
      getTransitions = function (childComponent) {
        return getTransitionProps(childComponent, index);
      };
    }
    return (0, _defaults3.default)({ getTransitions: getTransitions, parentState: parentState }, props.animate, child.props.animate);
  },
  getDomainFromChildren: function (props, axis, childComponents) {
    // eslint-disable-line max-statements, complexity, max-len
    var children = childComponents ? childComponents.slice(0) : _react2.default.Children.toArray(props.children);
    var horizontalChildren = childComponents.some(function (component) {
      return component.props && component.props.horizontal;
    });
    var horizontal = props && props.horizontal || horizontalChildren.length > 0;
    var currentAxis = _axis2.default.getCurrentAxis(axis, horizontal);
    var parentData = props.data ? _victoryCore.Data.getData(props, axis) : undefined;
    var polar = props.polar,
        startAngle = props.startAngle,
        endAngle = props.endAngle,
        categories = props.categories,
        minDomain = props.minDomain,
        maxDomain = props.maxDomain;

    var baseParentProps = { polar: polar, startAngle: startAngle, endAngle: endAngle, categories: categories, minDomain: minDomain, maxDomain: maxDomain };
    var parentProps = parentData ? (0, _assign3.default)(baseParentProps, { data: parentData }) : baseParentProps;

    var iteratee = function (child) {
      var role = child.type && child.type.role;
      var sharedProps = (0, _assign3.default)({}, child.props, parentProps);
      if (role === "legend" || role === "label") {
        return null;
      } else if (child.type && (0, _isFunction3.default)(child.type.getDomain)) {
        return child.props && child.type.getDomain(sharedProps, currentAxis);
      } else {
        return _victoryCore.Domain.getDomain(sharedProps, currentAxis);
      }
    };
    var childDomains = _victoryCore.Helpers.reduceChildren(children, iteratee, props);

    var min = childDomains.length === 0 ? 0 : _victoryCore.Collection.getMinValue(childDomains);
    var max = childDomains.length === 0 ? 1 : _victoryCore.Collection.getMaxValue(childDomains);
    return [min, max];
  },
  getDataFromChildren: function (props, childComponents) {
    var polar = props.polar,
        startAngle = props.startAngle,
        endAngle = props.endAngle,
        categories = props.categories,
        minDomain = props.minDomain,
        maxDomain = props.maxDomain;

    var parentProps = { polar: polar, startAngle: startAngle, endAngle: endAngle, categories: categories, minDomain: minDomain, maxDomain: maxDomain };
    var iteratee = function (child, childName, parent) {
      var role = child.type && child.type.role;
      var childProps = (0, _assign3.default)({}, child.props, parentProps);
      var childData = void 0;
      if (role === "axis" || role === "legend" || role === "label") {
        return null;
      } else if (child.type && (0, _isFunction3.default)(child.type.getData)) {
        child = parent ? _react2.default.cloneElement(child, parent.props) : child;
        childData = child.type.getData(childProps);
      } else {
        childData = _victoryCore.Data.getData(childProps);
      }
      return childData.map(function (datum) {
        return (0, _assign3.default)({ childName: childName }, datum);
      });
    };

    var children = childComponents ? childComponents.slice(0) : _react2.default.Children.toArray(props.children);
    var datasets = _victoryCore.Helpers.reduceChildren(children, iteratee, props);
    var stacked = children.filter(function (c) {
      return c.type && c.type.role === "stack";
    }).length;
    var group = stacked ? "eventKey" : "childName";
    return (0, _values3.default)((0, _groupBy3.default)(datasets, group));
  },
  getColor: function (calculatedProps, child, index) {
    // check for styles first
    var style = calculatedProps.style;
    var colorScale = calculatedProps.colorScale,
        color = calculatedProps.color;

    if (style && style.data && style.data.fill) {
      return style.data.fill;
    }
    colorScale = child.props && child.props.colorScale ? child.props.colorScale : colorScale;
    color = child.props && child.props.color ? child.props.color : color;
    if (!colorScale && !color) {
      return undefined;
    }
    var colors = Array.isArray(colorScale) ? colorScale : _victoryCore.Style.getColorScale(colorScale);
    return color || colors[index % colors.length];
  },
  getWidth: function (props) {
    var datasets = props.datasets,
        scale = props.scale,
        horizontal = props.horizontal;

    var range = horizontal ? scale.y.range() : scale.x.range();
    var extent = Math.abs(range[1] - range[0]);
    var seriesLength = Array.isArray(datasets[0]) ? datasets[0].length : 1;
    var bars = datasets.length * seriesLength + 2;
    var barRatio = 0.5;
    return { width: Math.round(barRatio * extent / bars) };
  },
  getStyle: function (theme, style, role) {
    var defaultStyle = theme && theme[role] && theme[role].style ? theme[role].style : {};
    return _victoryCore.Helpers.getStyles(style, defaultStyle);
  },
  getChildStyle: function (child, index, calculatedProps) {
    var style = calculatedProps.style,
        role = calculatedProps.role;

    var childStyle = child.props.style || {};
    if (Array.isArray(childStyle)) {
      return childStyle;
    }
    var childRole = child.type && child.type.role;
    var defaultFill = childRole === "stack" ? undefined : this.getColor(calculatedProps, child, index);
    var defaultColor = childRole === "line" ? { fill: "none", stroke: defaultFill } : { fill: defaultFill };
    var dataWidth = role === "stack" ? {} : this.getWidth(calculatedProps);
    var dataStyle = (0, _defaults3.default)({}, childStyle.data, (0, _assign3.default)({}, dataWidth, style.data, defaultColor));
    var labelsStyle = (0, _defaults3.default)({}, childStyle.labels, style.labels);
    return {
      parent: style.parent,
      data: dataStyle,
      labels: labelsStyle
    };
  },
  getStringsFromCategories: function (childComponents, axis) {
    var iteratee = function (child) {
      var role = child.type && child.type.role;
      var childProps = child.props || {};
      if (role === "legend" || role === "label" || !childProps.categories) {
        return null;
      } else {
        return _victoryCore.Data.getStringsFromCategories(childProps, axis);
      }
    };
    return _victoryCore.Helpers.reduceChildren(childComponents.slice(0), iteratee);
  },
  getStringsFromData: function (childComponents, axis) {
    var iteratee = function (child) {
      var role = child.type && child.type.role;
      var childProps = child.props || {};
      var data = void 0;
      if (role === "legend" || role === "label") {
        return null;
      } else if (child.type && (0, _isFunction3.default)(child.type.getData)) {
        data = child.type.getData(childProps);
      } else {
        data = _victoryCore.Data.getData(childProps);
      }
      var attr = axis === "x" ? "xName" : "yName";
      return data.map(function (d) {
        return d[attr];
      }).filter(Boolean);
    };
    return _victoryCore.Helpers.reduceChildren(childComponents.slice(0), iteratee);
  },
  getStringsFromChildren: function (props, axis, childComponents) {
    childComponents = childComponents || _react2.default.Children.toArray(props.children);
    var categories = (0, _isPlainObject3.default)(props.categories) ? props.categories[axis] : props.categories;
    var axisComponent = _axis2.default.getAxisComponent(childComponents, axis);
    var axisStrings = axisComponent ? _victoryCore.Data.getStringsFromAxes(axisComponent.props, axis) : [];
    var categoryStrings = categories || this.getStringsFromCategories(childComponents, axis);
    var dataStrings = this.getStringsFromData(childComponents, axis);
    return (0, _uniq3.default)((0, _flatten3.default)([].concat(_toConsumableArray(categoryStrings), _toConsumableArray(dataStrings), _toConsumableArray(axisStrings))));
  },
  getCategories: function (props, axis) {
    var categories = _victoryCore.Data.getCategories(props, axis) || this.getStringsFromChildren(props, axis);
    return categories.length > 0 ? categories : undefined;
  }
};