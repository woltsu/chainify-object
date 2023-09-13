import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { chainify } from "./chainify";
import { Builder, ChainifyOpts } from "./types";

describe("chainify", () => {
  describe.each(testInstances)("type %s", (_, obj) => {
    describe.each([
      [
        "serial",
        {
          serial: true,
        },
      ],
      ["parallel", { serial: false }],
    ] as [string, ChainifyOpts][])("mode %s", (_, opts) => {
      let chainified: Builder<TestObject>;

      beforeAll(() => {
        vi.spyOn(obj, "doAsyncWork");
        vi.spyOn(obj, "doSyncWork");
      });

      beforeEach(() => {
        vi.clearAllMocks();
        chainified = chainify(obj, opts);
      });

      it("makes the object chainable", async () => {
        await chainified
          .doSyncWork()
          .doAsyncWork("test1")
          .doSyncWork()
          .doAsyncWork("test2");

        expect(obj.doAsyncWork).toHaveBeenCalledTimes(2);
        expect(obj.doAsyncWork).toHaveBeenCalledWith("test1");
        expect(obj.doAsyncWork).toHaveBeenCalledWith("test2");
        expect(obj.doSyncWork).toHaveBeenCalledTimes(2);
      });

      it("handles variables", async () => {
        const x = chainified
          .doSyncWork()
          .doAsyncWork("test1")
          .doSyncWork()
          .doAsyncWork("test2").variable;

        expect(x).toEqual("testVariable");
        expect(obj.doAsyncWork).not.toHaveBeenCalled();
        expect(obj.doSyncWork).not.toHaveBeenCalled();
      });
    });
  });
});

type TestObject = {
  doAsyncWork: (a: string) => Promise<string>;
  doSyncWork: () => boolean;
  variable: string;
  staticWork?: () => boolean;
};

class TestClass {
  doAsyncWork = async (test: string) => {
    return await new Promise<string>((res) => {
      setTimeout(() => {
        res(test);
      }, 100);
    });
  };

  doSyncWork = () => {
    return true;
  };

  variable = "testVariable";
}

const testInstances: [string, TestObject][] = [
  ["class instance", new TestClass()],
  [
    "object",
    {
      doAsyncWork: async (test) => {
        return await new Promise<string>((res) => {
          setTimeout(() => {
            res(test);
          }, 1000);
        });
      },
      doSyncWork: () => {
        return true;
      },
      variable: "testVariable",
    },
  ],
];
