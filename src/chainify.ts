import { Builder, ChainifyOpts, UnknownPromise } from "./types";

// TODO: What if then is never triggered?
export const chainify = <T extends object>(
  target: T,
  opts: ChainifyOpts = { serial: true }
): Builder<T> => {
  let promises: [UnknownPromise, unknown[]][] = [];

  const proxy = new Proxy(target, {
    get: (target, prop, receiver) => {
      if (prop === "then") {
        return Reflect.get(target, prop, receiver);
      }

      const chainedFunction = (...p: unknown[]) => {
        promises.push([
          Reflect.get(target, prop, receiver) as UnknownPromise,
          p,
        ]);

        return proxy;
      };

      return chainedFunction;
    },
  }) as Builder<T>;

  proxy.then = async (res) => {
    if (opts.serial) {
      for (const [promise, p] of promises) {
        await Promise.resolve(promise(...p));
      }
    } else {
      await Promise.all(promises.map(([promise, p]) => promise(p)));
    }

    promises = [];
    await res?.(null);
  };

  return proxy as Builder<T>;
};
