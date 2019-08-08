Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign2 = require("lodash/assign");

var _assign3 = _interopRequireDefault(_assign2);

var _defaults2 = require("lodash/defaults");

var _defaults3 = _interopRequireDefault(_defaults2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _victoryCore = require("victory-core");

var _victoryAxis = require("../victory-axis/victory-axis");

var _victoryAxis2 = _interopRequireDefault(_victoryAxis);

var _victoryPolarAxis = require("../victory-polar-axis/victory-polar-axis");

var _victoryPolarAxis2 = _interopRequireDefault(_victoryPolarAxis);

var _helperMethods = require("./helper-methods");

var _wrapper = require("../../helpers/wrapper");

var _wrapper2 = _interopRequireDefault(_wrapper);

var _commonProps = require("../../helpers/common-props");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fallbackProps = {
  width: 450,
  height: 300,
  padding: 50
};

var VictoryChart = function (_React$Component) {
  _inherits(VictoryChart, _React$Component);

  function VictoryChart(props) {
    _classCallCheck(this, VictoryChart);

    var _this = _possibleConstructorReturn(this, (VictoryChart.__proto__ || Object.getPrototypeOf(VictoryChart)).call(this, props));

    _this.state = {};
    if (props.animate) {
      _this.state = {
        nodesShouldLoad: false,
        nodesDoneLoad: false,
        animating: true
      };
    }
    _this.setAnimationState = _wrapper2.default.setAnimationState.bind(_this);
    _this.events = _wrapper2.default.getAllEvents(props);
    return _this;
  }

  _createClass(VictoryChart, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.events = _wrapper2.default.getAllEvents(this.props);
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.animate) {
        this.setAnimationState(this.props, nextProps);
      }
      this.events = _wrapper2.default.getAllEvents(nextProps);
    }

    // the old ones were bad

  }, {
    key: "getNewChildren",
    value: function getNewChildren(props, childComponents, calculatedProps) {
      var children = (0, _helperMethods.getChildren)(props, childComponents, calculatedProps);
      var getAnimationProps = _wrapper2.default.getAnimationProps.bind(this);
      return children.map(function (child, index) {
        var childProps = (0, _assign3.default)({ animate: getAnimationProps(props, child, index) }, child.props);
        return _react2.default.cloneElement(child, childProps);
      });
    }
  }, {
    key: "renderContainer",
    value: function renderContainer(containerComponent, props) {
      var containerProps = (0, _defaults3.default)({}, containerComponent.props, props);
      return _react2.default.cloneElement(containerComponent, containerProps);
    }
  }, {
    key: "getContainerProps",
    value: function getContainerProps(props, calculatedProps) {
      var width = props.width,
          height = props.height,
          standalone = props.standalone,
          theme = props.theme,
          polar = props.polar;
      var domain = calculatedProps.domain,
          scale = calculatedProps.scale,
          style = calculatedProps.style,
          origin = calculatedProps.origin,
          radius = calculatedProps.radius,
          horizontal = calculatedProps.horizontal;

      return {
        domain: domain, scale: scale, width: width, height: height, standalone: standalone, theme: theme, style: style.parent, horizontal: horizontal,
        polar: polar, radius: radius, origin: polar ? origin : undefined
      };
    }
  }, {
    key: "render",
    value: function render() {
      var props = this.state && this.state.nodesWillExit ? this.state.oldProps || this.props : this.props;
      var modifiedProps = _victoryCore.Helpers.modifyProps(props, fallbackProps, "chart");
      var eventKey = modifiedProps.eventKey,
          containerComponent = modifiedProps.containerComponent,
          groupComponent = modifiedProps.groupComponent,
          standalone = modifiedProps.standalone,
          externalEventMutations = modifiedProps.externalEventMutations;

      var axes = props.polar ? modifiedProps.defaultPolarAxes : modifiedProps.defaultAxes;
      var childComponents = (0, _helperMethods.getChildComponents)(modifiedProps, axes);
      var calculatedProps = (0, _helperMethods.getCalculatedProps)(modifiedProps, childComponents);
      var newChildren = this.getNewChildren(modifiedProps, childComponents, calculatedProps);
      var containerProps = standalone ? this.getContainerProps(modifiedProps, calculatedProps) : {};
      var container = standalone ? this.renderContainer(containerComponent, containerProps) : groupComponent;
      if (this.events) {
        return _react2.default.createElement(
          _victoryCore.VictorySharedEvents,
          {
            container: container,
            eventKey: eventKey,
            events: this.events,
            externalEventMutations: externalEventMutations
          },
          newChildren
        );
      }
      return _react2.default.cloneElement(container, container.props, newChildren);
    }
  }]);

  return VictoryChart;
}(_react2.default.Component);

VictoryChart.displayName = "VictoryChart";
VictoryChart.propTypes = _extends({}, _commonProps.BaseProps, {
  children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node]),
  defaultAxes: _propTypes2.default.shape({
    independent: _propTypes2.default.element,
    dependent: _propTypes2.default.element
  }),
  defaultPolarAxes: _propTypes2.default.shape({
    independent: _propTypes2.default.element,
    dependent: _propTypes2.default.element
  }),
  endAngle: _propTypes2.default.number,
  innerRadius: _victoryCore.PropTypes.nonNegative,
  startAngle: _propTypes2.default.number
});
VictoryChart.defaultProps = {
  containerComponent: _react2.default.createElement(_victoryCore.VictoryContainer, null),
  defaultAxes: {
    independent: _react2.default.createElement(_victoryAxis2.default, null),
    dependent: _react2.default.createElement(_victoryAxis2.default, { dependentAxis: true })
  },
  defaultPolarAxes: {
    independent: _react2.default.createElement(_victoryPolarAxis2.default, null),
    dependent: _react2.default.createElement(_victoryPolarAxis2.default, { dependentAxis: true })
  },
  groupComponent: _react2.default.createElement("g", null),
  standalone: true,
  theme: _victoryCore.VictoryTheme.grayscale
};
VictoryChart.expectedComponents = ["groupComponent", "containerComponent"];
exports.default = VictoryChart;