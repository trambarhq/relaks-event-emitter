class GenericEvent {
  constructor(type, target, props) {
    this.type = type;
    this.target = target;
    this.defaultPrevented = false;
    this.defaultPostponed = null;
    this.propagationStopped = false;
    this.decisionPromise = null;
    Object.assign(this, props);
  }

  preventDefault() {
    this.defaultPrevented = true;
  }

  postponeDefault(promise) {
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

  stopImmediatePropagation() {
    this.propagationStopped = true;
  }

  waitForDecision() {
    return Promise.resolve(this.decisionPromise);
  }
}

export {
  GenericEvent,
};
