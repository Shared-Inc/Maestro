class Logger {
  log(context) {
    // https://stackoverflow.com/questions/39022216/react-native-programmatically-check-if-in-remote-js-debugging-is-enabled
    const debuggerEnabled = typeof atob !== 'undefined';

    if (!__DEV__ || !debuggerEnabled) {
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
