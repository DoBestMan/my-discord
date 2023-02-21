export class Utils {
  static async awaitSleep(ms) {
    console.log('waiting for ' + ms / 1000 + ' seconds...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }
}
