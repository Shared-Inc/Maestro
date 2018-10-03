class Plugin {
  static get instanceKey() {
    throw new Error('Maestro plugins must override static get instanceKey()');
  }

  maestro = null;

  constructor(maestro) {
    this.maestro = maestro;
  }
}

export default Plugin;
