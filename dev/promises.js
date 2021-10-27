async function test() {
  const start = Date.now();
  console.log('[s]', start);
  const arr = [4, 5, 1, 2, 3];
  const arrPromises = arr.map(
    (el) =>
      new Promise(async (resolve) => {
        await new Promise((resolve) => setTimeout(resolve, el * 1000));
        console.log('[m]', start);
        resolve(el);
      })
  );
  const result = await Promise.allSettled(arrPromises);
  console.log('[e]', start, result);
  return result;
}

async function run() {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await test();
  }
}

run();
