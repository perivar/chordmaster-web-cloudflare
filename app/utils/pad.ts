const pad = (num: number, size = 2): string => {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};
export default pad;
