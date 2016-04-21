'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _kourierLang = require('kourier-lang');

var _serviceCore = require('service-core');

var _serviceCore2 = _interopRequireDefault(_serviceCore);

var _kismatch = require('kismatch');

var _kismatch2 = _interopRequireDefault(_kismatch);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadAdapter = function loadAdapter(id) {
  return _fs2.default.readFileSync(__dirname + '/../adapters/' + id + '.kal', 'utf-8');
};

var endpoints = [{

  pattern: {
    cmd: 'transform',
    from: _kismatch2.default.types.string,
    to: _kismatch2.default.types.string,
    data: _kismatch2.default.types.object,
    fromAdapter: _kismatch2.default.types.object,
    toAdapter: _kismatch2.default.types.object
  },

  action: function action(_ref) {
    var from = _ref.from;
    var to = _ref.to;
    var data = _ref.data;
    var customFromAdapter = _ref.customFromAdapter;
    var customToAdapter = _ref.customToAdapter;


    try {
      var fromAdapter = customFromAdapter || loadAdapter(from);
      var toAdapter = customToAdapter || loadAdapter(to);

      var normalized = (0, _kourierLang.transform)(fromAdapter, data, {
        dir: 'output'
      });

      //console.log('normalized', normalized)

      var transformed = (0, _kourierLang.transform)(toAdapter, normalized, {
        dir: 'input'
      });

      //console.log('transformed', transformed)

      return transformed;
    } catch (e) {
      console.log('e', e);
    }
  }
}];

exports.default = function (config) {
  return (0, _serviceCore2.default)(endpoints, config);
};