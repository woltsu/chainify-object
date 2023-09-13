import { Builder, ChainifyOpts, UnknownPromise } from "./types";

export const chainify = <T extends object>(
  target: T,
  opts: ChainifyOpts = { serial: true }
): Builder<T> => {
  let promises: [UnknownPromise, unknown[]][] = [];

  const proxy = new Proxy(target, {
    get: (target, prop, receiver) => {
      const targetProperty = Reflect.get(target, prop, receiver);

      if (typeof targetProperty !== "function" || prop === "then") {
        return targetProperty;
      }

      return (...p: unknown[]) => {
        promises.push([targetProperty as UnknownPromise, p]);
        return proxy;
      };
    },
  }) as Builder<T>;

  proxy.then = async (res) => {
    if (opts.serial) {
      for (const [promise, p] of promises) {
        await Promise.resolve(promise(...p));
      }
    } else {
      await Promise.all(promises.map(([promise, p]) => promise(...p)));
    }

    promises = [];
    await res?.(null);
  };

  return proxy as Builder<T>;
};
