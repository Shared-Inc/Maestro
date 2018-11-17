import Plugin from './Plugin';
import Store from './Store';

class Manager extends Plugin {
  static get storeName() {
    throw new Error('Maestro managers must override get storeName()');
  }

  _store = null;

  constructor(maestro) {
    super(maestro);

    this.maestro.link(this);
    this._store = new Store(this.constructor.initialStore);
  }

  get store() {
    return this._store.getData();
  }

  updateStore(object) {
    this._store.update(object);

    this.maestro.dispatchStoreUpdate();
  }

  resetStore() {
    this.updateStore(this.constructor.initialStore);
  }
}

export default Manager;
