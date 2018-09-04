class Plugin {
  static get name() {
    throw new Error('Maestro plugins must override static get name()');
  }

  maestro = null;

  constructor(maestro) {
    this.maestro = maestro;
  }
}

export default Plugin;
