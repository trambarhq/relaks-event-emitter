class RelaksEventEmitter {
  constructor() {
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
  addEventListener(type, handler, beginning) {
    if (typeof(type) !== 'string') {
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
      this.listeners.unshift({ type,  handler });
    } else {
      this.listeners.push({ type,  handler });
    }
  }

  /**
   * Remove an event handler
   *
   * @param  {String} type
   * @param  {Function} handler
   */
  removeEventListener(type, handler) {
    this.listeners = this.listeners.filter((listener) => {
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
  waitForEvent(type) {
    let promise = this.promises[type];
    if (!promise) {
      let resolve, reject;
      promise = new Promise((f1, f2) => {
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
  triggerEvent(evt) {
    const promise = this.promises[evt.type];
    if (promise) {
      delete this.promises[evt.type];
    }
    const listeners = this.listeners.filter((listener) => {
      return (listener.type === evt.type);
    });
    if (listeners.length === 0) {
      if (promise) {
        promise.resolve(evt);
        return true;
      } else {
        return false;
      }
    }
    evt.decisionPromise = this.dispatchEvent(evt, listeners).then(() => {
      if (promise) {
        promise.resolve(evt);
      }
    });
    return true;
  }

  dispatchEvent(evt, listeners) {
    for (var i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener.handler.call(evt.target, evt);

      if (evt.defaultPostponed) {
        const remainingListeners = listeners.slice(i + 1);
        return evt.defaultPostponed.then((decision) => {
          if (decision === false) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
          }
          if (!evt.propagationStopped) {
            return this.dispatchEvent(evt, remainingListeners);
          }
        });
      }
      if (evt.propagationStopped) {
        break;
      }
    }
    return Promise.resolve();
  }
}

export {
  RelaksEventEmitter,
  RelaksEventEmitter as EventEmitter,
};
