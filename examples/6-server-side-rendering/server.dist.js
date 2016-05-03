'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dec, _dec2, _class;

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

var reducer = function reducer(state, action) {
  if (action.type === 'HELLO') return { message: 'Hello World!' };else return state || { message: 'Test' };
};

var App = (_dec = (0, _index.transact)(function (state, props) {
  return [_index.Task.resolve({ type: 'HELLO' })];
}), _dec2 = (0, _reactRedux.connect)(function (state) {
  return { message: state.message };
}), _dec(_class = _dec2(_class = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(App).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      var message = this.props.message;

      return _react2.default.createElement(
        'h1',
        null,
        message
      );
    }
  }]);

  return App;
}(_react2.default.Component)) || _class) || _class);


var routes = _react2.default.createElement(_reactRouter.Route, { path: '/', component: App });

server.listen(8080, function () {
  server.all('/', function (req, res) {
    (0, _reactRouter.match)({ routes: routes, location: req.url }, function (err, redirect, routerProps) {
      var store = (0, _redux.createStore)(reducer);
      var c = routerProps.components[0];
      console.log(c._mapTasks);
      console.log(c);

      var documentElement = _react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        _react2.default.createElement(_index.RouterRunContext, routerProps)
      );

      var markup = _server2.default.renderToStaticMarkup(documentElement);
      res.send('<!doctype html>\n' + markup);
    });
  });
});
