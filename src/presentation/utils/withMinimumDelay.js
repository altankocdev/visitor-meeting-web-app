export async function withMinimumDelay(promise, minimumMs = 700) {
  const [result] = await Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, minimumMs)),
  ]);
  return result;
}