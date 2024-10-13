// trim start and keep only one space if there are more than two
export const trimStartMultiple = (str: string) => {
  return str.replace(/^\s{2,}/g, " ");
};

// trim end and keep only one space if there are more than two
export const trimEndMultiple = (str: string) => {
  return str.replace(/\s{2,}$/g, " ");
};

// trim and keep only one space if there are more than two
export const trimMultiple = (str: string) => {
  const first = trimStartMultiple(str);
  const second = trimEndMultiple(first);
  return second;
};
