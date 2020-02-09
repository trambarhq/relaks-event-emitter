function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var RelaksEventEmitter =
/*#__PURE__*/
function () {
  function RelaksEventEmitter() {
    _classCallCheck(this, RelaksEventEmitter);

    this.listeners = [];
    this.promises = [];
  }
  /**
   * Attach an event handler
   *
   * @param  {String} type
   * @param  {Function} handler
   * @param  {Boolean|undefined} beginning
   */


  _createClass(RelaksEventEmitter, [{
    key: "addEventListener",
    value: function addEventListener(type, handler, beginning) {
      if (typeof type !== 'string') {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Invalid event type passed to addEventListener()');
        }

        return;
      }

      if (!(handler instanceof Function) && handler != null) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Non-function passed to addEventListener()');
        }

        return;
      }

      if (beginning) {
        this.listeners.unshift({
          type: type,
          handler: handler
        });
      } else {
        this.listeners.push({
          type: type,
          handler: handler
        });
      }
    }
    /**
     * Remove an event handler
     *
     * @param  {String} type
     * @param  {Function} handler
     */

  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, handler) {
      this.listeners = this.listeners.filter(function (listener) {
        return !(listener.type === type && listener.handler === handler);
      });
    }
    /**
     * Return a promise that will be fulfilled when the specified event occurs
     *
     * @param  {String} type
     *
     * @return {Promise<Event>}
     */

  }, {
    key: "waitForEvent",
    value: function waitForEvent(type) {
      var promise = this.promises[type];

      if (!promise) {
        var resolve, reject;
        promise = new Promise(function (f1, f2) {
          resolve = f1;
          reject = f2;
        });
        promise.resolve = resolve;
        promise.reject = reject;
        this.promises[type] = promise;
      }

      return promise;
    }
    /**
     * Send event to event listeners, return true or false depending on whether
     * there were any listeners
     *
     * @param  {RelaksDjangoDataSourceEvent} evt
     *
     * @return {Boolean}
     */

  }, {
    key: "triggerEvent",
    value: function triggerEvent(evt) {
      var promise = this.promises[evt.type];

      if (promise) {
        delete this.promises[evt.type];
      }

      var listeners = this.listeners.filter(function (listener) {
        return listener.type === evt.type;
      });

      if (listeners.length === 0) {
        if (promise) {
          promise.resolve(evt);
          return true;
        } else {
          return false;
        }
      }

      evt.decisionPromise = this.dispatchEvent(evt, listeners).then(function () {
        if (promise) {
          promise.resolve(evt);
        }
      });
      return true;
    }
  }, {
    key: "dispatchEvent",
    value: function () {
      var _dispatchEvent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(evt, listeners) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, listener, decision;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 3;
                _iterator = listeners[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 18;
                  break;
                }

                listener = _step.value;
                listener.handler.call(evt.target, evt);

                if (!evt.defaultPostponed) {
                  _context.next = 13;
                  break;
                }

                _context.next = 11;
                return evt.defaultPostponed;

              case 11:
                decision = _context.sent;

                if (decision === false) {
                  evt.preventDefault();
                  evt.stopImmediatePropagation();
                }

              case 13:
                if (!evt.propagationStopped) {
                  _context.next = 15;
                  break;
                }

                return _context.abrupt("break", 18);

              case 15:
                _iteratorNormalCompletion = true;
                _context.next = 5;
                break;

              case 18:
                _context.next = 24;
                break;

              case 20:
                _context.prev = 20;
                _context.t0 = _context["catch"](3);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 24:
                _context.prev = 24;
                _context.prev = 25;

                if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                  _iterator["return"]();
                }

              case 27:
                _context.prev = 27;

                if (!_didIteratorError) {
                  _context.next = 30;
                  break;
                }

                throw _iteratorError;

              case 30:
                return _context.finish(27);

              case 31:
                return _context.finish(24);

              case 32:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[3, 20, 24, 32], [25,, 27, 31]]);
      }));

      function dispatchEvent(_x, _x2) {
        return _dispatchEvent.apply(this, arguments);
      }

      return dispatchEvent;
    }()
  }]);

  return RelaksEventEmitter;
}();

var GenericEvent =
/*#__PURE__*/
function () {
  function GenericEvent(type, target, props) {
    _classCallCheck(this, GenericEvent);

    this.type = type;
    this.target = target;
    this.defaultPrevented = false;
    this.defaultPostponed = null;
    this.propagationStopped = false;
    this.decisionPromise = null;
    Object.assign(this, props);
  }

  _createClass(GenericEvent, [{
    key: "preventDefault",
    value: function preventDefault() {
      this.defaultPrevented = true;
    }
  }, {
    key: "postponeDefault",
    value: function postponeDefault(promise) {
      if (promise instanceof Function) {
        promise = promise();
      }

      if (!promise || !(promise.then instanceof Function)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Non-promise passed to postponeDefault()');
        }

        return;
      }

      this.defaultPostponed = promise;
    }
  }, {
    key: "stopImmediatePropagation",
    value: function stopImmediatePropagation() {
      this.propagationStopped = true;
    }
  }, {
    key: "waitForDecision",
    value: function () {
      var _waitForDecision = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.decisionPromise;

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function waitForDecision() {
        return _waitForDecision.apply(this, arguments);
      }

      return waitForDecision;
    }()
  }]);

  return GenericEvent;
}();

export { RelaksEventEmitter as EventEmitter, GenericEvent, RelaksEventEmitter };
