export const getFirstPathParam = (path: string): string => path.split('/').filter((pathParam) => !!pathParam)[0];

export const generateRandomIntFromInterval = (min = 0, max = 1): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
