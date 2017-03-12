'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableView = function (_React$Component) {
  _inherits(TableView, _React$Component);

  function TableView(props) {
    _classCallCheck(this, TableView);

    var _this = _possibleConstructorReturn(this, (TableView.__proto__ || Object.getPrototypeOf(TableView)).call(this));

    _this.state = {
      name: 'Bobs',
      password: '',
      update: '',
      joinTable: false,
      turn: false,
      bet: 0,
      newBet: 0,
      message: '',
      rejoinWaitTimer: 0,
      sitOutNext: false,
      quitYesOrNo: false,
      token: null,
      bootPlayer: false,
      bootPlayerTimer: 0
    };
    window.setTableState = _this.setState.bind(_this);
    return _this;
  }

  _createClass(TableView, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'table',
        null,
        React.createElement(
          'tbody',
          null,
          Object.entries(this.state).map(function (entry) {
            entry[1] = String(entry[1]);
            return React.createElement(
              'tr',
              null,
              React.createElement(
                'td',
                null,
                entry[0],
                ':'
              ),
              React.createElement(
                'td',
                null,
                entry[1]
              )
            );
          })
        )
      );
    }
  }]);

  return TableView;
}(React.Component);