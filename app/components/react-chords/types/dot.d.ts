declare module "DotModule" {
  type DotType = {
    string: number;
    fret: number;
    finger: number; // 0 | 1 | 2 | 3 | 4 | 5;
    strings: number;
    lite?: boolean;
    dark?: boolean;
  };

  interface OffsetsProp {
    [key: number]: number;
  }
}
