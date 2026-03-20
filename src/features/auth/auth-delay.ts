export const simulateNetworkDelay = async () => {
  const delay = Math.floor(Math.random() * 1000) + 300;

  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};