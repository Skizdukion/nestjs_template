export class ChainHandle {
  private handler: Handler[] = [];
  private onFailBreak: () => Promise<void>;
  private onAllSuccess: () => Promise<void>;

  public addHandler(handle: Handler) {
    this.handler.push(handle);
    return this;
  }

  public setOnFailBreak(_onFailBreak: () => Promise<void>) {
    this.onFailBreak = _onFailBreak;
    return this;
  }

  public setOnAllSuccess(_onAllSuccess: () => Promise<void>) {
    this.onAllSuccess = _onAllSuccess;
    return this;
  }

  public async execute() {
    if (this.handler.length == 0) {
      return;
    }

    let noError = true;
    for (let index = 0; index < this.handler.length; index++) {
      const element = this.handler[index];
      const result = await element.execute();
      if (result.break) {
        await this.onFailBreak();
        break;
      }

      if (!result.isSuccess) {
        noError = false;
      }
    }

    if (noError && this.onAllSuccess) {
      await this.onAllSuccess();
    }
  }
}

export class Handler {
  constructor(
    private handleFunction: () => Promise<void>,
    private options?: HandlerOptions,
  ) {}

  async execute(): Promise<HanldeResult> {
    try {
      await this.handleFunction();
      return {
        isSuccess: true,
        break: false,
      };
    } catch (e) {
      if (this.options.isLogErrorMsg ?? false) {
        console.log(e);
      }

      if (this.options.error) {
        await this.options.error(e);
      }

      return {
        isSuccess: false,
        break: this.options.failBreak ?? false,
      };
    }
  }
}

interface HandlerOptions {
  error?: (e) => any;
  failBreak?: boolean;
  isLogErrorMsg?: boolean;
}

interface HanldeResult {
  break: boolean;
  isSuccess: boolean;
}
