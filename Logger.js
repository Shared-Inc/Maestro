class Logger {
  log(context) {
    if (!__DEV__) {
      return;
    }

    this._logDivider();

    if (Array.isArray(context)) {
      context.forEach(message => {
        console.log(message);
      });
    } else {
      console.log(context);
    }
  }

  _logDivider() {
    console.log('');
    console.log('');
    console.log('========== MAESTRO LOG ==========');
  }
}

export default new Logger();
