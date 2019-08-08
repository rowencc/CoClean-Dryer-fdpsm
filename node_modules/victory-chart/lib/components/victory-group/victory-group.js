Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defaults2 = require("lodash/defaults");

var _defaults3 = _interopRequireDefault(_defaults2);

var _assign2 = require("lodash/assign");

var _assign3 = _interopRequireDefault(_assign2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _victoryCore = require("victory-core");

var _wrapper = require("../../helpers/wrapper");

var _wrapper2 = _interopRequireDefault(_wrapper);

var _helperMethods = require("./helper-methods");

var _commonProps = require("../../helpers/common-props");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fallbackProps = {
  width: 450,
  height: 300,
  padding: 50,
  offset: 0
};

var VictoryGroup = function (_React$Component) {
  _inherits(VictoryGroup, _React$Component);

  function VictoryGroup(props) {
    _classCallCheck(this, VictoryGroup);

    var _this = _possibleConstructorReturn(this, (VictoryGroup.__proto__ || Object.getPrototypeOf(VictoryGroup)).call(this, props));

    if (props.animate) {
      _this.state = {
        nodesShouldLoad: false,
        nodesDoneLoad: false,
        animating: true
      };
      _this.setAnimationState = _wrapper2.default.setAnimationState.bind(_this);
      _this.events = _wrapper2.default.getAllEvents(props);
    }
    return _this;
  }

  _createClass(VictoryGroup, [{
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
          polar = props.polar,
          horizontal = props.horizontal;
      var domain = calculatedProps.domain,
          scale = calculatedProps.scale,
          style = calculatedProps.style,
          origin = calculatedProps.origin;

      return {
        domain: domain, scale: scale, width: width, height: height, standalone: standalone, theme: theme, style: style.parent, horizontal: horizontal,
        polar: polar, origin: origin
      };
    }
  }, {
    key: "render",
    value: function render() {
      var role = this.constructor.role;

      var props = this.state && this.state.nodesWillExit ? this.state.oldProps || this.props : this.props;
      var modifiedProps = _victoryCore.Helpers.modifyProps(props, fallbackProps, role);
      var eventKey = modifiedProps.eventKey,
          containerComponent = modifiedProps.containerComponent,
          standalone = modifiedProps.standalone,
          groupComponent = modifiedProps.groupComponent,
          externalEventMutations = modifiedProps.externalEventMutations;

      var childComponents = _react2.default.Children.toArray(modifiedProps.children);
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

  return VictoryGroup;
}(_react2.default.Component);

VictoryGroup.displayName = "VictoryGroup";
VictoryGroup.role = "group";
VictoryGroup.propTypes = _extends({}, _commonProps.BaseProps, _commonProps.DataProps, {
  children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node]),
  color: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  colorScale: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.string), _propTypes2.default.oneOf(["grayscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"])]),
  horizontal: _propTypes2.default.bool,
  offset: _propTypes2.default.number
});
VictoryGroup.defaultProps = {
  containerComponent: _react2.default.createElement(_victoryCore.VictoryContainer, null),
  groupComponent: _react2.default.createElement("g", null),
  samples: 50,
  scale: "linear",
  sortOrder: "ascending",
  standalone: true,
  theme: _victoryCore.VictoryTheme.grayscale
};
VictoryGroup.expectedComponents = ["groupComponent", "containerComponent", "labelComponent"];
VictoryGroup.getChildren = _helperMethods.getChildren;
exports.default = VictoryGroup;