'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _kourierLang = require('kourier-lang');

var _serviceCore = require('service-core');

var _serviceCore2 = _interopRequireDefault(_serviceCore);

var _kismatch = require('kismatch');

var _kismatch2 = _interopRequireDefault(_kismatch);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var pg = require('pg-promise')();
var db = void 0;

var endpoints = [{

  pattern: {
    cmd: 'transform',
    from: _kismatch2.default.types.string,
    to: _kismatch2.default.types.string,
    data: _kismatch2.default.types.object
  },

  action: function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_ref, _ref2) {
      var from = _ref.from;
      var to = _ref.to;
      var data = _ref.data;
      var dbUrl = _ref2.dbUrl;

      var _ref3, _ref4, fromAdapter, toAdapter, normalized, transformed;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Promise.all([db.query('SELECT text FROM adapters WHERE id=\'' + from + '\''), db.query('SELECT text FROM adapters WHERE id=\'' + to + '\'')]);

            case 2:
              _ref3 = _context.sent;
              _ref4 = _slicedToArray(_ref3, 2);
              fromAdapter = _ref4[0];
              toAdapter = _ref4[1];
              normalized = (0, _kourierLang.transform)(fromAdapter, data, { dir: 'output' });

              console.log('normalized', normalized);

              transformed = (0, _kourierLang.transform)(toAdapter, normalized, { dir: 'input' });

              console.log('transformed', transformed);

              return _context.abrupt('return', transformed);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function action(_x, _x2) {
      return ref.apply(this, arguments);
    };
  }()
}];

exports.default = function (config) {
  db = pg(config.dbUrl);
  return (0, _serviceCore2.default)(endpoints, config);
};