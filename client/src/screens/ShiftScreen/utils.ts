import { UserInfo } from "./models";

export function getEmptyCellsForSkeleton(cols: number, rows: number): UserInfo[][]{
    return Array(cols).fill(undefined).map(() => {
      return Array<UserInfo>(rows).fill({ name: "", id: "" });
  })
}