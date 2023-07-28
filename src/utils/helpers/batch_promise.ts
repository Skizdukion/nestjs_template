export class BatchPromise<T, G> {
  protected totalTimes: number;
  protected batchRange: number | undefined;
  protected skipIndex: number | undefined;
  protected func: (index: number) => Promise<T>;
  protected batchResolve: ((batch: any[]) => Promise<G>) | undefined;
  protected onFinishError: (allErrorIndex: number[]) => Promise<void>;
  protected loader: PromiseManager<T>;
  protected isLogError: boolean;

  constructor(totalTimes: number, func: (index: number) => Promise<T>) {
    this.func = func;
    this.totalTimes = totalTimes;
    this.loader = new PromiseManager(func);
  }

  setAfterBatchResolve(f: (batch: T[]) => Promise<G>) {
    this.batchResolve = f;
    return this;
  }

  setMaxRetries(maxRetry: number) {
    this.loader.maxRetries = maxRetry;
    return this;
  }

  setLogError(isLogError: boolean) {
    this.loader.logError = isLogError;
    return;
  }

  setBatchRange(range: number) {
    this.batchRange = range;
    this.loader.activeRetry = range;
    return this;
  }

  setSkipIndex(skipIndex: number) {
    this.skipIndex = skipIndex;
    return this;
  }

  setOnFinishError(func: (allErrorIndex: number[]) => Promise<any>) {
    this.onFinishError = func;
    return this;
  }

  async execute() {
    const _range = this.batchRange ?? this.totalTimes;

    const times = Math.ceil(this.totalTimes / _range);

    const skip = Math.floor(this.skipIndex ?? 0 / _range);

    for (let index = skip; index < times; index++) {
      const end =
        _range * (index + 1) > this.totalTimes
          ? this.totalTimes
          : _range * (index + 1);
      const start = _range * index;

      this.loader.createBatch(start, end);

      await this.loader.resolveCurrentBatch();
    }

    await this.loader.cleanUpError();

    const successPromise: (T | undefined)[] = [];
    const errorIndexPromise: number[] = [];

    for (const [key, value] of this.loader.promiseResultMap) {
      if (value.isSuccess) {
        successPromise.push(value.result);
      } else {
        errorIndexPromise.push(key);
      }
    }

    if (this.batchResolve) {
      await this.batchResolve(successPromise);
    }

    if (this.onFinishError) {
      await this.onFinishError(errorIndexPromise);
    }
  }
}

export class PromiseManager<T> {
  public promiseResultMap: Map<number, Records<T>> = new Map();

  public maxRetries = 1;

  public activeRetry = 200;

  private currentBatch: Promise<T>[] = [];

  public counting = 0;

  public logError = false;

  public errorsIndex: number[] = [];

  constructor(private func: (index: number) => Promise<T>) {}

  public async createBatch(fromIndex: number, toIndex: number) {
    this.currentBatch = Array.from(new Array(toIndex - fromIndex), (f, ix) =>
      this.func(fromIndex + ix),
    );
  }

  public setSkip(skip: number) {
    this.counting = skip;
  }

  public async resolveCurrentBatch() {
    const result = await Promise.allSettled(this.currentBatch);
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      const records: Records<T> = {
        counts: 0,
        index: index,
        result: undefined,
        isSuccess: false,
      };
      if (element.status == 'fulfilled') {
        records.result = element.value;
        records.isSuccess = true;
        this.promiseResultMap.set(this.counting + index, records);
      }
      if (element.status == 'rejected') {
        records.counts = records.counts + 1;
        this.promiseResultMap.set(this.counting + index, records);
        this.errorsIndex.push(this.counting + index);
        if (this.logError) {
          console.log(
            `Promise at index ${this.counting + index} failed with msg: ${
              element.reason
            }`,
          );
        }
      }
    }

    this.counting += this.currentBatch.length;
    this.currentBatch = [];
  }

  public async cleanUpError() {
    console.log('Cleaning up error -------');
    while (this.errorsIndex.length > 0) {
      const result = await Promise.allSettled(
        this.errorsIndex.map((item) =>
          this.func(this.promiseResultMap.get(item)?.index!),
        ),
      );

      let jindex = 0;
      while (jindex < this.errorsIndex.length) {
        const element = result[jindex];
        const records: Records<T> = this.promiseResultMap.get(
          this.errorsIndex[jindex],
        )!;
        if (element.status == 'fulfilled') {
          records.result = element.value;
          records.isSuccess = true;
          this.promiseResultMap.set(records.index, records);
          delete this.errorsIndex[jindex];
        }
        if (element.status == 'rejected') {
          records.counts = records.counts + 1;
          if (records.counts > this.maxRetries) {
            delete this.errorsIndex[jindex];
          } else {
            this.promiseResultMap.set(records.index, records);
          }
        }
        jindex++;
      }

      this.errorsIndex = this.errorsIndex.filter((item) => item !== undefined);
    }
  }
}

type Records<T> = {
  counts: number;
  index: number;
  result: T | undefined;
  isSuccess: boolean;
};
