Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCalculatedProps = exports.getChildren = undefined;

var _orderBy2 = require("lodash/orderBy");

var _orderBy3 = _interopRequireDefault(_orderBy2);

var _keys2 = require("lodash/keys");

var _keys3 = _interopRequireDefault(_keys2);

var _assign2 = require("lodash/assign");

var _assign3 = _interopRequireDefault(_assign2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _victoryCore = require("victory-core");

var _wrapper = require("../../helpers/wrapper");

var _wrapper2 = _interopRequireDefault(_wrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fallbackProps = {
  width: 450,
  height: 300,
  padding: 50
};

// Assumes data in `datasets` is sorted by `Data.getData`.
/* eslint-disable func-style */
/* eslint-disable no-use-before-define */
function fillData(props, datasets) {
  var fillInMissingData = props.fillInMissingData;

  var xMap = datasets.reduce(function (prev, dataset) {
    dataset.forEach(function (datum) {
      prev[datum._x instanceof Date ? datum._x.getTime() : datum._x] = true;
    });
    return prev;
  }, {});
  var xKeys = (0, _keys3.default)(xMap).map(function (k) {
    return +k;
  });
  var xArr = (0, _orderBy3.default)(xKeys);

  return datasets.map(function (dataset) {
    var indexOffset = 0;
    var isDate = dataset[0] && dataset[0]._x instanceof Date;
    var filledInData = xArr.map(function (x, index) {
      x = +x;
      var datum = dataset[index - indexOffset];

      if (datum) {
        var x1 = isDate ? datum._x.getTime() : datum._x;
        if (x1 === x) {
          return datum;
        } else {
          indexOffset++;
          var y = fillInMissingData ? 0 : null;
          x = isDate ? new Date(x) : x;
          return { x: x, y: y, _x: x, _y: y };
        }
      } else {
        var _y = fillInMissingData ? 0 : null;
        x = isDate ? new Date(x) : x;
        return { x: x, y: _y, _x: x, _y: _y };
      }
    });

    return filledInData;
  });
}

function getY0(datum, index, datasets) {
  if (datum.y0) {
    return datum.y0;
  }
  var y = datum._y;
  var previousDatasets = datasets.slice(0, index);
  var previousPoints = previousDatasets.reduce(function (prev, dataset) {
    return prev.concat(dataset.filter(function (previousDatum) {
      return datum._x instanceof Date ? previousDatum._x.getTime() === datum._x.getTime() : previousDatum._x === datum._x;
    }).map(function (previousDatum) {
      return previousDatum._y || 0;
    }));
  }, []);
  var y0 = previousPoints.length && previousPoints.reduce(function (memo, value) {
    var sameSign = y < 0 && value < 0 || y >= 0 && value >= 0;
    return sameSign ? +value + memo : memo;
  }, 0);
  return previousPoints.some(function (point) {
    return point instanceof Date;
  }) ? new Date(y0) : y0;
}

/* eslint-disable no-nested-ternary */
function addLayoutData(props, datasets, index) {
  var xOffset = props.xOffset || 0;
  return datasets[index].map(function (datum) {
    var yOffset = getY0(datum, index, datasets) || 0;
    return (0, _assign3.default)({}, datum, {
      _y0: !(datum._y instanceof Date) ? yOffset : yOffset ? new Date(yOffset) : datum._y,
      _y1: datum._y === null ? null : datum._y instanceof Date ? new Date(+datum._y + +yOffset) : datum._y + yOffset,
      _x1: datum._x === null ? null : datum._x instanceof Date ? new Date(+datum._x + +xOffset) : datum._x + xOffset
    });
  });
}
/* eslint-enable no-nested-ternary */

function stackData(props) {
  var dataFromChildren = _wrapper2.default.getDataFromChildren(props);
  var datasets = fillData(props, dataFromChildren);
  return datasets.map(function (d, i) {
    return addLayoutData(props, datasets, i);
  });
}

function getCalculatedProps(props, childComponents) {
  childComponents = childComponents || _react2.default.Children.toArray(props.children);
  var role = "stack";
  var style = _wrapper2.default.getStyle(props.theme, props.style, role);
  var horizontal = props.horizontal || childComponents.every(function (component) {
    return component.props.horizontal;
  });
  var categories = {
    x: _wrapper2.default.getCategories(props, "x"),
    y: _wrapper2.default.getCategories(props, "y")
  };
  var datasets = stackData(props);
  var children = childComponents.map(function (c, i) {
    return _react2.default.cloneElement(c, { data: datasets[i] });
  });
  var domain = {
    x: _wrapper2.default.getDomain((0, _assign3.default)({}, props, { categories: categories }), "x", children),
    y: _wrapper2.default.getDomain((0, _assign3.default)({}, props, { categories: categories }), "y", children)
  };
  var range = {
    x: _victoryCore.Helpers.getRange(props, "x"),
    y: _victoryCore.Helpers.getRange(props, "y")
  };
  var baseScale = {
    x: _victoryCore.Scale.getScaleFromProps(props, "x") || _victoryCore.Scale.getDefaultScale(),
    y: _victoryCore.Scale.getScaleFromProps(props, "y") || _victoryCore.Scale.getDefaultScale()
  };
  var xScale = baseScale.x.domain(domain.x).range(range.x);
  var yScale = baseScale.y.domain(domain.y).range(range.y);
  var scale = {
    x: horizontal ? yScale : xScale,
    y: horizontal ? xScale : yScale
  };
  var colorScale = props.colorScale;
  return { datasets: datasets, categories: categories, range: range, domain: domain, horizontal: horizontal, scale: scale, style: style, colorScale: colorScale, role: role };
}

function getLabels(props, datasets, index) {
  if (!props.labels) {
    return undefined;
  }
  return datasets.length === index + 1 ? props.labels : undefined;
}

function getChildProps(props, calculatedProps) {
  var categories = calculatedProps.categories,
      domain = calculatedProps.domain,
      range = calculatedProps.range,
      scale = calculatedProps.scale,
      horizontal = calculatedProps.horizontal;

  return {
    height: props.height,
    width: props.width,
    padding: _victoryCore.Helpers.getPadding(props),
    standalone: false,
    theme: props.theme,
    categories: categories,
    domain: domain,
    range: range,
    scale: scale,
    horizontal: horizontal
  };
}

function getColorScale(props, child) {
  var role = child.type && child.type.role;
  var colorScaleOptions = child.props.colorScale || props.colorScale;
  if (role !== "group" && role !== "stack") {
    return undefined;
  }
  return props.theme ? colorScaleOptions || props.theme.props.colorScale : colorScaleOptions;
}

function getChildren(props, childComponents, calculatedProps) {
  props = _victoryCore.Helpers.modifyProps(props, fallbackProps, "stack");
  childComponents = childComponents || _react2.default.Children.toArray(props.children);
  calculatedProps = calculatedProps || getCalculatedProps(props, childComponents);
  var _calculatedProps = calculatedProps,
      datasets = _calculatedProps.datasets;

  var childProps = getChildProps(props, calculatedProps);

  return childComponents.map(function (child, index) {
    var data = datasets[index];
    var style = _wrapper2.default.getChildStyle(child, index, calculatedProps);
    var labels = props.labels ? getLabels(props, datasets, index) : child.props.labels;

    return _react2.default.cloneElement(child, (0, _assign3.default)({
      key: index,
      labels: labels,
      domainPadding: child.props.domainPadding || props.domainPadding,
      theme: props.theme,
      labelComponent: props.labelComponent || child.props.labelComponent,
      style: style,
      colorScale: getColorScale(props, child),
      data: data,
      polar: props.polar
    }, childProps));
  });
}

exports.getChildren = getChildren;
exports.getCalculatedProps = getCalculatedProps;