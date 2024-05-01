import React, { Dispatch, MutableRefObject, SetStateAction, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { generateHeaderViews, getEmptyMatrix, getUniqueString } from '@app/common/utils'
import { OptimizeShiftResponse } from '@app/services/api/models'
import NameCellView from '../elements/common/NameCellView'
import TableView from '../elements/common/TableView'
import { UniqueString, User } from '../models'

const initialPosts = [getUniqueString('עמדה')] //TODO li18n
const initialHours = [getUniqueString('שעה')] //TODO li18n

export default function useShiftTableView(
    selectedNameId: string | undefined,
    isEditing = false,
    names: User[],
    callOptimizeAPI: () => Promise<OptimizeShiftResponse | undefined>
) {
    const [posts, setPosts] = useState<UniqueString[]>(initialPosts)
    const [hours, setHours] = useState<UniqueString[]>(initialHours)
    const [shifts, setShifts] = useState<User[][]>()
    const [isOptimized, setIsOptimized] = useState<boolean>(false)
    const [focusedPostHeaderId, setFocusedPostHeaderId] = useState<string>()
    const [focusedHourHeaderId, setFocusedHourHeaderId] = useState<string>()
    const postCounter = React.useRef<number>(initialPosts.length)
    const hoursCounter = React.useRef<number>(initialHours.length)

    const emptyCellsForSkeleton: User[][] = useMemo(() => {
        return getEmptyMatrix<User>(hours.length, posts.length, {
            name: ' ',
            id: '', //TODO nice to have add shift id composed by post and hour ids
        })
    }, [hours, posts])

    const postHeaderViews = useMemo(
        () => generateHeaderViews(posts, focusedPostHeaderId, isEditing, (newTextVal, index)=>onHeaderEdit(setPosts, newTextVal, index)),
        [posts, isEditing]
    )
    const hoursHeaderViews = useMemo(
        () => generateHeaderViews(hours, focusedHourHeaderId, isEditing, (newTextVal, index)=>onHeaderEdit(setHours, newTextVal, index)),
        [hours, isEditing]
    )
    const shiftDataViews = useMemo(
        () => generateShiftDataElements(shifts, emptyCellsForSkeleton, selectedNameId),
        [shifts, emptyCellsForSkeleton, selectedNameId, isEditing]
    )

    const onOptimize = useCallback(
        () => calcOptimizeShifts(names, hours, posts, callOptimizeAPI, ()=>setIsOptimized, setShifts),
        [names, hours, posts, callOptimizeAPI]
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
                    onColAdd={() => {
                        addPost(getNewPostName('עמדה', posts, postCounter), setPosts, setShifts, setFocusedPostHeaderId) //TODO li18n
                    }}
                    onRowRemove={(index) => {
                        removeShift(index, setHours, setShifts, removeShiftsByHour)
                    }}
                    onRowAdd={() => {
                        addHour(getNewPostName('שעה', posts, hoursCounter), setHours, setShifts, setFocusedHourHeaderId) //TODO li18n
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
function onHeaderEdit(setState: Dispatch<SetStateAction<UniqueString[]>>, newTextVal: string, index: number) {
    setState((prev) => {
        const newHeaders = JSON.parse(JSON.stringify(prev))
        newHeaders[index].value = newTextVal
        return newHeaders
    })
}

function removeShift(
    index: number,
    setTitles: React.Dispatch<React.SetStateAction<UniqueString[]>>,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>,
    removeShiftBy: (shifts: User[][] | undefined, index: number) => User[][] | undefined
) {
    setTitles((pre) => {
        const ret = pre.toSpliced(index, 1)

        return ret
    })
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
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>,
    setFocusHeaderId: React.Dispatch<React.SetStateAction<string | undefined>>
) {
    const newPost = getUniqueString(postName)
    setFocusHeaderId(newPost.id)
    setTitles((prev) => prev.concat(newPost))
    setShifts((prev) => {
        if (!prev) return prev
        return prev.map((postsInHour) => {
            return postsInHour.concat({ name: '', id: '' }) //TODO nice to have add shift id composed by post and hour ids
        })
    })
}

function addHour(
    hourName: string,
    setTitles: React.Dispatch<React.SetStateAction<UniqueString[]>>,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>,
    setFocusHeaderId: React.Dispatch<React.SetStateAction<string | undefined>>
) {
    const newHour = getUniqueString(hourName)
    setFocusHeaderId(newHour.id)
    setTitles((prev) => [...prev, newHour])
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
            return <NameCellView user={user.name} isSelected={user?.id === selectedNameId} />
        })
    )
    return uiArray
}

async function calcOptimizeShifts(
    names: User[],
    hours: UniqueString[],
    posts: UniqueString[],
    callOptimizeAPI: () => Promise<OptimizeShiftResponse | undefined>,
    setIsOptimized: (isOpt: boolean)=>void,
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

function getNewPostName(prefix: string, posts: UniqueString[], postCounter: MutableRefObject<number>): string {
    postCounter.current++
    return `${prefix} ${postCounter.current}`
}

//------------------------------------------StyleSheet--------------------------------------------------------
const styles = StyleSheet.create({
    text: { textAlign: 'center' },
    title: { flex: 1 },
    table: { position: 'absolute', top: 0, left: 0, width: '100%' },
})
