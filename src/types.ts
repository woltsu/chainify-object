/**
 * @see https://stackoverflow.com/a/62833444/10540870
 * @see https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules__types_jquery_misc_d_.jquery.thenable.html
 */
export type Then = (
  onfulfilled?: ((value: unknown) => PromiseLike<unknown>) | undefined | null
) => Promise<unknown>;

export type Builder<T> = {
  [Key in keyof T]: T[Key] extends (...args: any[]) => unknown
    ? (...args: Parameters<T[Key]>) => Builder<T>
    : T[Key];
} & {
  then: Then;
};

export type ChainifyOpts = {
  serial: boolean;
};

export type UnknownPromise = (...p: unknown[]) => Promise<unknown>;
