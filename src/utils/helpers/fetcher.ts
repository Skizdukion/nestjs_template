export default class Fetcher<T> {
  static config = {
    maxRetries: 5,
    delayEachRetryInMiliseconds: 1000,
  };
  private retryCount = 0;
  private onEachFailed: () => Promise<void> | undefined;
  private defaulFailedValue: T | undefined;
  constructor(private fetchFunction: () => Promise<T>) {}

  async started(): Promise<T | undefined> {
    try {
      const data = await this.fetchFunction();
      return data;
    } catch (error) {
      if (this.retryCount >= Fetcher.config.maxRetries) {
        if (this.defaulFailedValue) {
          return this.defaulFailedValue;
        } else {
          throw error;
        }
      }
      this.retryCount += 1;
      await Promise.all([
        new Promise((resolve) =>
          setTimeout(resolve, Fetcher.config.delayEachRetryInMiliseconds),
        ),
        this.onEachFailed ? this.onEachFailed() : null,
      ]);
      return this.started();
    }
  }

  setOnEachFailedFunction(func: () => Promise<void>) {
    this.onEachFailed = func;
    return this;
  }

  setDefaultFailedValue(defaultValue: T) {
    this.defaulFailedValue = defaultValue;
    return this;
  }
}
