# chainify-object

> [!NOTE]
> This tool is primarily a POC and has not been battle-tested in production

Make any object's functions chainable, without losing the types! Works for class instances as well.

## Installation
```bash
npm i @woltsu/chainify-object
```

## Usage

Considering the following builder-like object:

```ts
const obj = {
  doWorkA: async () => {...},
  doWorkB: () => {...},
  doWorkC: () => async () => {...}
}
```

Normally, we would use its functions like so:

```ts
await obj.doWorkA();
obj.doWorkB();
await obj.doWorkC();
```

With `chainify-object`, we can instead make the object's functions chainable:

```ts
import { chainify } from "@woltsu/chainify-object";

await chainify(obj).doWorkA().doWorkB().doWorkC();
```
