import { chainify } from "./chainify";

class TestWorker {
  doWork = async (id: string) => {
    await new Promise(async (res) => {
      setTimeout(() => {
        console.log("Work done: ", id);
        res(null);
      }, Math.random() * 3000);
    });
  };

  doOtherWork = async (id: string) => {
    await this.doWork(`other-${id}`);
  };

  doSyncWork = (id: string) => {
    console.log("Sync work done:", id);
  };
}

const worker = new TestWorker();
const builder = chainify(worker);

(async () => {
  await builder
    .doWork("1")
    .doOtherWork("2")
    .doSyncWork("3")
    .doWork("4")
    .doOtherWork("5");

  await builder.doWork("6").doOtherWork("7");
})();
