import Dispatcher from './Dispatcher';
import Logger from './Logger';

class Flow extends Dispatcher {
  static get name() {
    throw new Error('Maestro flows must override static get name()');
  }

  maestro = null;

  constructor(maestro) {
    super();

    this.maestro = maestro;
  }

  start() {
    // PASS
  }

  progress() {
    // PASS
  }

  finish() {
    // PASS
  }

  updateStore(object) {
    Logger.log([
      `Dispatching flow store update`,
      'Update object:',
      object,
      'Available to linked instances:',
      this._linkedInstances,
    ]);

    this._store.update(object);

    this.dispatchStoreUpdate();
  }
}

export default Flow;
