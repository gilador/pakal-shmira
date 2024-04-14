import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { generateHeaderViews, getEmptyMatrix, getUniqueString } from '@app/common/utils'
import { OptimizeShiftResponse } from '@app/services/api/models'
import NameCellView from '../elements/common/NameCellView'
import TableView from '../elements/common/TableView'
import { UniqueString, User } from '../models'

const mockedPosts = [
    getUniqueString('ש.ג1'),
    getUniqueString('ש.ג2'),
    getUniqueString('מערבי'),
    getUniqueString('מזרחי'),
]
const mockedHours = [
    getUniqueString('0600-1000'),
    getUniqueString('1000-1400'),
    getUniqueString('1400-1600'),
    getUniqueString('1600-2000'),
    getUniqueString('2000-2400'),
    getUniqueString('0000-0400'),
]

export default function useShiftTableView(
    selectedNameId: string | undefined,
    isEditing = false,
    names: User[],
    callOptimizeAPI: () => Promise<OptimizeShiftResponse | undefined>
) {
    const [posts, setPosts] = useState<UniqueString[]>(mockedPosts)
    const [hours, setHours] = useState<UniqueString[]>(mockedHours)
    const [shifts, setShifts] = useState<User[][]>()
    const [isOptimized, setIsOptimized] = React.useState<boolean>(false)

    const emptyCellsForSkeleton: User[][] = useMemo(() => {
        return getEmptyMatrix<User>(hours.length, posts.length, {
            name: ' ',
            id: '',
        })
    }, [JSON.stringify(hours), JSON.stringify(posts)])

    const postHeaderViews = useMemo(() => generateHeaderViews(posts, isEditing, setPosts), [JSON.stringify(posts)])
    const hoursHeaderViews = useMemo(() => generateHeaderViews(hours, isEditing, setHours), [JSON.stringify(hours)])
    const shiftDataViews = useMemo(
        () => generateShiftDataElements(shifts, emptyCellsForSkeleton, selectedNameId),
        [JSON.stringify(shifts), emptyCellsForSkeleton, selectedNameId]
    )

    const onOptimize = useCallback(
        () => calcOptimizeShifts(names, hours, posts, callOptimizeAPI, setIsOptimized, setShifts),
        [JSON.stringify(names), JSON.stringify(hours), JSON.stringify(posts), callOptimizeAPI]
    )
    const ShiftTable = useMemo(
        () => (
            <View style={{ flex: 1, overflow: 'scroll' }}>
                <TableView
                    horizontalHeaderViews={postHeaderViews}
                    verticalHeaderViews={hoursHeaderViews}
                    tableElementViews={shiftDataViews}
                    style={[styles.table, { zIndex: -1, overflow: 'scroll' }]}
                    onColRemove={(index) => {
                        removeShift(index, setPosts, setShifts, removeShiftsByPost)
                    }}
                    onColAdd={(headerName) => {
                        addPost(headerName, setPosts, setShifts)
                    }}
                    onRowRemove={(index) => {
                        removeShift(index, setHours, setShifts, removeShiftsByHour)
                    }}
                    onRowAdd={(headerName) => {
                        addHour(headerName, setHours, setShifts)
                    }}
                    enableEdit={isEditing}
                />
            </View>
        ),
        [isEditing, posts, hours, shiftDataViews]
    )

    return {
        posts,
        hours,
        isOptimized,
        ShiftTable,
        onOptimize,
    }
}

//------------------------------------------functions--------------------------------------------------------
function removeShift(
    index: number,
    setTitles: React.Dispatch<React.SetStateAction<UniqueString[]>>,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>,
    removeShiftBy: (shifts: User[][] | undefined, index: number) => User[][] | undefined
) {
    setTitles((pre) => {
        const ret = pre.toSpliced(index, 1)
        console.log('gilad - index:', index)
        console.log('gilad - pre:', pre)
        console.log('gilad - ret:', ret)
        return ret})
    setShifts((prev) => removeShiftBy(prev, index))
}

function removeShiftsByPost(shifts: User[][] | undefined, postIndex: number): User[][] | undefined {
    if (!shifts || (shifts.length > 0 && shifts[0].length === 2)) return shifts
    const newShifts = shifts.map((hours) => {
        return hours.filter((_posts, index) => {
            return index !== postIndex
        })
    })

    return newShifts
}

function removeShiftsByHour(shifts: User[][] | undefined, hourIndex: number) {
    if (!shifts) return shifts
    const newShifts = shifts.filter((_hour, index) => {
        return hourIndex !== index
    })

    return newShifts
}

function addPost(
    postName: string,
    setTitles: React.Dispatch<React.SetStateAction<UniqueString[]>>,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>
) {
    setTitles((prev) => [...prev, getUniqueString(postName)])
    setShifts((prev) => {
        if (!prev) return prev
        return prev.map((postsInHour) => {
            return [...postsInHour, { name: '', id: '' }]
        })
    })
}

function addHour(
    hourName: string,
    setTitles: React.Dispatch<React.SetStateAction<UniqueString[]>>,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>
) {
    setTitles((prev) => [...prev, getUniqueString(hourName)])
    setShifts((prev) => {
        if (!prev) return prev
        return [...prev, Array(prev[0].length).fill({ name: '', id: '' })]
    })
}

function generateShiftDataElements(
    shifts: User[][] | undefined,
    emptyCellsForSkeleton: User[][],
    selectedNameId: string | undefined
) {
    let uiArray = (shifts ?? emptyCellsForSkeleton).map((array) =>
        array.map((user) => {
            return <NameCellView user={user.name} isDisable={true} isSelected={user?.id === selectedNameId} />
        })
    )
    return uiArray
}

async function calcOptimizeShifts(
    names: User[],
    hours: UniqueString[],
    posts: UniqueString[],
    callOptimizeAPI: () => Promise<OptimizeShiftResponse | undefined>,
    setIsOptimized: React.Dispatch<React.SetStateAction<boolean>>,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>
) {
    try {
        // Optimize user shifts asynchronously
        const optimizedShift = await callOptimizeAPI()

        if (!optimizedShift) {
            return
        }

        {
            //TODO validate response
        }

        setIsOptimized(optimizedShift.isOptim)
        // Update shift data

        const shifts = getEmptyMatrix<User>(hours.length, posts.length, {
            name: '',
            id: '',
        })

        optimizedShift.result.forEach((userShift, userIndex) => {
            userShift.forEach((hourArray, hourIndex) => {
                hourArray.forEach((post, postIndex) => {
                    if (post) {
                        shifts[postIndex][hourIndex] = names[userIndex]
                    }
                })
            })
        })
        setShifts(shifts)
    } catch (error) {
        console.error('Error occurred while optimizing shifts:', error)
        // Handle error appropriately, e.g., show error message to the user
    }
}

//------------------------------------------StyleSheet--------------------------------------------------------
const styles = StyleSheet.create({
    text: { textAlign: 'center' },
    title: { flex: 1 },
    table: { position: 'absolute', top: 0, left: 0, width: '100%', paddingHorizontal: 100 },
})
