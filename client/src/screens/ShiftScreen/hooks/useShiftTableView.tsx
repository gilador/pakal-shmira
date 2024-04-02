import { Col, Row, TableWrapper } from 'react-native-reanimated-table'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { generateHeaderViews, getEmptyMatrix } from '@app/common/utils'
import { UniqueString, User } from '../models'

import React, { Fragment, ReactNode, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react'

import ActionButton, { IconType } from '@app/common/components/ActionButton'
import { OptimizeShiftResponse } from '@app/services/api/models'
import NameCellView from '../elements/common/NameCellView'
import TableView from '../elements/common/TableView'
import { getUniqueString } from '@app/common/utils'

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
    console.log(`useShiftTableView-> shifts:${JSON.stringify(shifts)}`)
    const [isOptimized, setIsOptimized] = React.useState<boolean>(false)
    const [tableHeight, setTableHeight] = React.useState(0)

    React.useLayoutEffect(() => {
        const updateSize = () => {
            setTableHeight(window.innerHeight)
        }
        window.addEventListener('resize', updateSize)
        updateSize()
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    const emptyCellsForSkeleton: User[][] = useMemo(() => {
        return getEmptyMatrix<User>(hours.length, posts.length, {
            name: ' ',
            id: '',
        })
    }, [JSON.stringify(hours), JSON.stringify(posts)])

    const postHeaderViews = useMemo(
        () => generateHeaderViews([{ id: 'fakePostForSpace', value: '' }, ...posts]),
        [JSON.stringify(posts)]
    )
    const removePostViews = useMemo(
        () =>
            generateRemoveElements(
                [{ id: 'fakePostForSpace', value: '' }, ...posts],
                setPosts,
                setShifts,
                styles.removePostButton,
                removeShiftsByPost
            ),
        [JSON.stringify(posts)]
    )
    const removeHoursViews = useMemo(
        () => generateRemoveElements(hours, setHours, setShifts, styles.removeHourButton, removeShiftsByHour),
        [JSON.stringify(hours)]
    )

    const hoursHeaderViews = useMemo(() => generateHeaderViews(hours), [JSON.stringify(hours)])
    const shiftDataViews = useMemo(
        () => generateShiftDataElements(shifts, emptyCellsForSkeleton, selectedNameId, setShifts),
        [JSON.stringify(shifts), emptyCellsForSkeleton, selectedNameId]
    )

    const onOptimize = useCallback(
        () => calcOptimizeShifts(names, hours, posts, callOptimizeAPI, setIsOptimized, setShifts),
        [JSON.stringify(names), JSON.stringify(hours), JSON.stringify(posts), callOptimizeAPI]
    )
    const ShiftTable = useMemo(
        () => (
            <View style={{ flex: 1, overflow: 'visible' }}>
                {isEditing && (
                    <View style={styles.addPostButtonContainer}>
                        <ActionButton
                            style={styles.addPostButton}
                            type={IconType.add}
                            cb={() => setPosts((prev) => [...prev, getUniqueString('עמדה חדשה')])}
                        />
                    </View>
                )}
                <TableView
                    horizontalHeaderViews={postHeaderViews}
                    verticalHeaderViews={hoursHeaderViews}
                    tableElementViews={shiftDataViews}
                    style={[styles.table, { zIndex: -1, overflow: 'scroll' }]}
                />
                <TableView
                    horizontalHeaderViews={postHeaderViews}
                    verticalHeaderViews={hoursHeaderViews}
                    tableElementViews={shiftDataViews}
                    style={{ display: 'none', height: tableHeight }}
                />
                {isEditing && (
                    <TableView
                        horizontalHeaderViews={removePostViews}
                        verticalHeaderViews={removeHoursViews}
                        tableElementViews={shiftDataViews}
                        style={[styles.table, { zIndex: -1 }]}
                    />
                )}
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
function removeShiftsByPost(shifts: User[][] | undefined, postIndex: number): User[][] | undefined {
    if (!shifts) return shifts
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

function generateShiftDataElements(
    shifts: User[][] | undefined,
    emptyCellsForSkeleton: User[][],
    selectedNameId: string | undefined,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>
) {
    let uiArray = (shifts ?? emptyCellsForSkeleton).map((array) =>
        array.map((user) => {
            return <NameCellView user={user.name} isDisable={true} isSelected={user?.id === selectedNameId} />
        })
    )
    return uiArray
}

function generateRemoveElements(
    titles: UniqueString[],
    setTitles: React.Dispatch<React.SetStateAction<UniqueString[]>>,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>,
    style: StyleProp<ViewStyle>,
    removeShift: (shifts: User[][] | undefined, index: number) => User[][] | undefined
) {
    let uiArray = titles.map((title, titleIndex) => {
        if (!title.value) {
            return
        }
        const cb = () => {
            setTitles((pre) => pre.filter((val) => val?.id !== title?.id))
            setShifts((prev) => removeShift(prev, titleIndex))
        }
        return <ActionButton type={IconType.close} cb={cb} style={style} />
    })
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
    container: {
        flex: 15,
        paddingHorizontal: 100,
        overflow: 'scroll',
    },
    head2: {
        height: 50,
        borderRadius: 0,
    },
    text: { textAlign: 'center' },
    title: { flex: 1 },
    removePostButtonsContainer: { bottom: -25, zIndex: 1 },
    addPostButtonContainer: { position: 'absolute', end: -31, top: 50, width: '100%', zIndex: -1 },
    addHourButtonContainer: { position: 'absolute', top: -21, width: '100%' },
    addPostButton: { alignSelf: 'flex-end', end: 100 },
    addHourButton: { alignSelf: 'flex-start' },
    removePostButton: { position: 'absolute', top: -25 },
    removeHourButton: { position: 'absolute', left: -25 },
    table: { position: 'absolute', top: 0, left: 0, width: '100%', paddingHorizontal: 100 },
})
