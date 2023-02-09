export const getFirstPathParam = (path: string): string => path.split('/').filter((pathParam) => !!pathParam)[0];

export const generateRandomIntFromInterval = (min = 0, max = 1): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generateRandomIdxFromInterval = (reqNumOfIdx = 0, maxIdx = 0): number[] => {
  const idcs: number[] = [];

  while (idcs.length < reqNumOfIdx) {
    const newRandIdx: number = generateRandomIntFromInterval(0, maxIdx);

    if (!idcs.includes(newRandIdx)) {
      idcs.push(newRandIdx);
    }
  }

  return idcs;
};
