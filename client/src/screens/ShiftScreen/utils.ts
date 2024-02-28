import { UserInfo } from "./models";

export function getEmptyCellsForSkeleton<T>(cols: number, rows: number, fillObj: T): T[][]{
    return Array(cols).fill(undefined).map(() => {
      return Array<T>(rows).fill(fillObj);
  })
}