'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _class;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactRouter = require('react-router');

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _index = require('../../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var server = (0, _express2.default)();

var reducer = function reducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? { message: '' } : arguments[0];
  var action = arguments[1];

  if (action.type === 'APPEND') return _extends({}, state, { message: '' + state.message + action.payload });
  if (action.type === 'COLOR') return _extends({}, state, { color: action.payload });else return state;
};

/*
 * Task creators that will be scheduled and run by the middleware.
 */
var appendText = (0, _index.taskCreator)('ERROR', 'APPEND', function (s) {
  return s;
});
var changeColor = (0, _index.taskCreator)('ERROR', 'COLOR', function (s) {
  return s;
});
var appendTextAsync = (0, _index.taskCreator)('ERROR', 'APPEND', function (s) {
  return new Promise(function (res) {
    setTimeout(function () {
      return res(s);
    }, 50);
  });
});

/*
 * Component that creates tasks to be run, as well as connect to redux state.
 */
var App = (_dec = (0, _index.transact)(function () {
  return [appendText('Hello'), appendText(' World'), changeColor('purple'), appendTextAsync('!')];
}), _dec2 = (0, _reactRedux.connect)(function (state) {
  return {
    message: state.message,
    color: state.color
  };
}), _dec(_class = _dec2(_class = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(App).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var color = _props.color;
      var message = _props.message;

      return _react2.default.createElement(
        'div',
        { style: { color: color } },
        _react2.default.createElement(
          'h1',
          null,
          message
        )
      );
    }
  }]);

  return App;
}(_react2.default.Component)) || _class) || _class);


var routes = _react2.default.createElement(_reactRouter.Route, { path: '/', component: App });

server.listen(8080, function () {
  server.all('/', function (req, res) {
    (0, _reactRouter.match)({ routes: routes, location: req.url }, function (err, redirect, routerProps) {
      // Install function returns a middleware, and a `done` promise.
      var installed = (0, _index.install)(routerProps);

      var store = (0, _redux.createStore)(reducer, undefined, (0, _redux.applyMiddleware)(installed));

      var documentElement = _react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        _react2.default.createElement(_index.RouterRunContext, routerProps)
      );

      // Wait for all route tasks to resolve.
      installed.done.then(function () {
        // Now call render to get the final HTML.
        var markup = _server2.default.renderToStaticMarkup(documentElement);
        res.send('\n        <!doctype html>\n        ' + markup + '\n        <pre>Store state = ' + JSON.stringify(store.getState(), null, 2) + '</pre>\n        ');
      });
    });
  });
});
