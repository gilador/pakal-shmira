export function getEmptyMatrix<T>(
    cols: number,
    rows: number,
    fillObj: T
): T[][] {
    return Array(cols)
        .fill(undefined)
        .map(() => {
            return Array<T>(rows).fill(fillObj)
        })
}

export function transposeMat(mat: any[][]) {
    const m = mat.length // Number of rows in the original array
    const n = mat[0].length // Number of columns in the original array

    const transformedArray = []

    // Iterate over columns (n)
    for (let j = 0; j < n; j++) {
        const row = []
        // Iterate over rows (m)
        for (let i = 0; i < m; i++) {
            row.push(mat[i][j])
        }
        transformedArray.push(row)
    }
    return transformedArray
}

export function extractWords(inputString: string): string[] {
    const words = inputString.split(/\s+/)
    return words.filter((word) => word.trim().length > 0)
}
