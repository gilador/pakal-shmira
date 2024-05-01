import { ReactNode } from 'react'

import NameCellView from '@app/screens/shiftScreen/elements/common/NameCellView'
import { UniqueString } from '@app/screens/shiftScreen/models'

export function getEmptyMatrix<T>(cols: number, rows: number, fillObj: T): T[][] {
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

export function getUniqueString(value: string): UniqueString {
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    return {
        id: value + id,
        value: value,
    }
}

export function generateHeaderViews(
    headers: UniqueString[],
    focusedHeaderId?: string,
    editMode?: boolean,
    onHeaderEdit?: (newTextVal: string, index: number) => void
): ReactNode[] {
    return headers.map((header, index) => {
        return header ? (
            <NameCellView
                user={header.value}
                editable={editMode}
                isFocused={focusedHeaderId === header.id}
                onEdit={(newTextVal) => {
                    onHeaderEdit && onHeaderEdit(newTextVal, index)
                }}
            />
        ) : undefined
    })
}
