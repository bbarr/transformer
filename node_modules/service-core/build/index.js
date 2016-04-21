'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _kismatch = require('kismatch');

var _kismatch2 = _interopRequireDefault(_kismatch);

var _kisschema = require('kisschema');

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var mapcat = _ramda2.default.pipe(_ramda2.default.map, _ramda2.default.flatten);

var api = {

  // initialize new set of endpoints, returns new process function
  createService: function createService(endpoints, config) {
    if (!endpoints || !endpoints.length) throw new Error('Must pass non-empty array of endpoints to createService');
    var service = { config: config, endpoints: endpoints };
    return Object.assign({}, service, api, {
      process: api.process.bind(null, service)
    });
  },

  // tries to evaluate payload
  process: function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(service, payload) {
      var match, authErrors, inputErrors, result;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              match = api.match(service, payload);

              if (match) {
                _context.next = 4;
                break;
              }

              return _context.abrupt('return', [404]);

            case 4:
              _context.next = 6;
              return api.authorize(service, payload, match);

            case 6:
              authErrors = _context.sent;

              if (!authErrors) {
                _context.next = 9;
                break;
              }

              return _context.abrupt('return', [401, authErrors]);

            case 9:
              inputErrors = api.validate(service, payload, match);

              if (!inputErrors) {
                _context.next = 12;
                break;
              }

              return _context.abrupt('return', [400, inputErrors]);

            case 12:
              _context.next = 14;
              return api.call(service, payload, match);

            case 14:
              result = _context.sent;
              return _context.abrupt('return', [200, result]);

            case 18:
              _context.prev = 18;
              _context.t0 = _context['catch'](0);
              return _context.abrupt('return', [500, _context.t0]);

            case 21:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 18]]);
    }));

    return function process(_x, _x2) {
      return ref.apply(this, arguments);
    };
  }(),

  // applies matched endpoint's action
  call: function call(service, payload, match) {
    return match.action(payload, service);
  },


  // validates payload against matched endpoint
  validate: function validate(service, payload, _ref) {
    var validations = _ref.validations;

    if (!validations) return null;
    return (0, _kisschema.validate)(validations, payload);
  },


  // match endpoint
  match: function match(service, payload) {
    var pairs = mapcat(function (end) {
      return [end.pattern, function () {
        return end;
      }];
    }, service.endpoints);
    var matcher = _kismatch2.default.apply(undefined, _toConsumableArray(pairs));
    return matcher(payload);
  },


  // allows some basic auth to be applied per endpoint
  // TODO make this configurable
  authorize: function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(service, payload, _ref2) {
      var authRules = _ref2.authorizations;
      var promises;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (authRules) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt('return', null);

            case 2:
              if (service.config.authorizations) {
                _context2.next = 4;
                break;
              }

              return _context2.abrupt('return', null);

            case 4:
              promises = Object.keys(authRules).map(function (authName) {
                var auth = service.config.authorizations[authName];
                if (!auth) return "Looking for auth that isn't configured";
                return auth(authRules[authName], payload, service);
              });
              return _context2.abrupt('return', Promise.all(promises).then(function (results) {
                return _ramda2.default.find(function (result) {
                  return null !== result;
                }, results);
              }));

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function authorize(_x3, _x4, _x5) {
      return ref.apply(this, arguments);
    };
  }()
};

exports.default = api.createService;
