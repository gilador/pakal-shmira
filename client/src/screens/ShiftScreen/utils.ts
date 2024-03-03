import { User } from "./models";

export function getEmptyMatrix<T>(cols: number, rows: number, fillObj: T): T[][]{
    return Array(cols).fill(undefined).map(() => {
      return Array<T>(rows).fill(fillObj);
  })
}

export function transposeMat(mat: any[][]) {
  // console.log(`transposeMat - before: mat: ${JSON.stringify(mat)}`)
  const m = mat.length; // Number of rows in the original array
  const n = mat[0].length; // Number of columns in the original array
  
  const transformedArray = [];

  // Iterate over columns (n)
  for (let j = 0; j < n; j++) {
      const row = [];
      // Iterate over rows (m)
      for (let i = 0; i < m; i++) {
          row.push(mat[i][j]);
      }
      transformedArray.push(row);
  }
  // console.log(`transposeMat - after: transformedArray: ${JSON.stringify(transformedArray)}`)


  return transformedArray;
}