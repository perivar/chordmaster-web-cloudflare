declare module "BarreModule" {
  type BarreType = {
    frets: number[];
    barre: number;
    capo?: boolean;
    finger: number; // 0 | 1 | 2 | 3 | 4 | 5;
    lite?: boolean;
    dark?: boolean;
  };

  type FretXPositionType = {
    [key: number]: number[];
  };

  type OffsetType = {
    [key: number]: number;
  };
}
