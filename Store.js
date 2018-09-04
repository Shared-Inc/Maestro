class Store {
  _data = {};

  constructor(initialStore) {
    Object.assign(this._data, initialStore);
  }

  update(object) {
    Object.assign(this._data, object);
  }

  getData() {
    return this._data;
  }
}

export default Store;
