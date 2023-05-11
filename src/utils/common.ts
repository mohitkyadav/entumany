export const generateUniqueArray = (n: number): number[] => {
  const arr: number[] = [];

  for (let i = 0; i < n; i++) {
    arr.push(i);
  }

  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * n);
    const temp = arr[i];
    arr[i] = arr[randomIndex];
    arr[randomIndex] = temp;
  }

  return arr;
};
