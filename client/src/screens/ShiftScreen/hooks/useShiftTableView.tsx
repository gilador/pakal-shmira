import { Row, TableWrapper } from 'react-native-reanimated-table'
import { StyleSheet, View } from 'react-native'

import { getEmptyMatrix } from '@app/common/utils'
import { UniqueString, User } from '../models'

import React, { ReactNode, memo, useCallback, useMemo, useState } from 'react'

import ActionButton, { IconType } from '../elements/common/ActionButton'
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

    const emptyCellsForSkeleton: User[][] = useMemo(() => {
        return getEmptyMatrix<User>(hours.length, posts.length, {
            name: '',
            id: '',
        })
    }, [JSON.stringify(hours), JSON.stringify(posts)])
    const shiftDataElements = useMemo(
        () => generateShiftDataElements(shifts, emptyCellsForSkeleton, selectedNameId, setShifts),
        [JSON.stringify(shifts), emptyCellsForSkeleton, selectedNameId]
    )
    const postEditTopBarView = React.useMemo(() => {
        const flexHeadArray = Array(posts.length).fill(1)
        const shitPostsRemoveElements = generateRemoveElements(posts, setPosts, setShifts)
        return generatePostEditTopBarView(shitPostsRemoveElements, flexHeadArray, () => {
            setPosts((prev) => [...prev, getUniqueString('שם חדש')])
        })
    }, [JSON.stringify(posts), shifts])

    const hoursEditView = React.useMemo(() => {
        return generateHoursEditView(() => {
            setHours((prev) => [...prev, getUniqueString('שעה חדשה')])
        })
    }, [])

    // const flexHeadArray = useMemo(() => Array(posts.length).fill(1), [JSON.stringify(posts)])
    const onOptimize = useCallback(
        () => calcOptimizeShifts(names, hours, posts, callOptimizeAPI, setIsOptimized, setShifts),
        [JSON.stringify(names), JSON.stringify(hours), JSON.stringify(posts), callOptimizeAPI]
    )
    const ShiftTable = useMemo(
        () => (
            <View style={styles.container}>
                {isEditing && postEditTopBarView}
                <TableView posts={posts} hours={hours} uiArray={shiftDataElements} style={{ zIndex: -1 }} />
                {isEditing && hoursEditView}
            </View>
        ),
        [isEditing, posts, hours, shiftDataElements]
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
function removePostFromShifts(posts: User[][] | undefined, postIndex: number) {
    if (!posts) return posts
    const newShifts = posts.map((hours) => {
        return hours.filter((_posts, index) => {
            return index !== postIndex
        })
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

function generatePostEditTopBarView(
    shitPostsRemoveElements: ReactNode[],
    flexHeadArray: number[],
    addPostCB: () => void
) {
    return (
        <View>
            <View style={styles.addPostButtonContainer}>
                <ActionButton style={styles.addPostButton} type={IconType.add} cb={addPostCB} />
            </View>

            <TableWrapper>
                <Row
                    data={shitPostsRemoveElements}
                    flexArr={flexHeadArray}
                    style={styles.removePostButtonsContainer}
                    textStyle={styles.text}
                />
            </TableWrapper>
        </View>
    )
}

function generateHoursEditView(addHourCB: () => void) {
    return (
        <View>
            <View style={styles.addHourButtonContainer}>
                <ActionButton style={styles.addHourButton} type={IconType.add} cb={addHourCB} />
            </View>
        </View>
    )
}

function generateRemoveElements(
    posts: UniqueString[],
    setPosts: React.Dispatch<React.SetStateAction<UniqueString[]>>,
    setShifts: React.Dispatch<React.SetStateAction<User[][] | undefined>>
) {
    let uiArray = [undefined, ...posts].map((post, postIndex) => {
        if (!post) {
            return
        }
        const cb = () => {
            setPosts((pre) => pre.filter((val) => val?.id !== post?.id))
            setShifts((prev) => removePostFromShifts(prev, postIndex - 1))
        }
        return <ActionButton type={IconType.close} cb={cb} style={styles.removePostButton} />
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
        backgroundColor: '#f1f8ff',
        borderRadius: 0,
    },
    text: { textAlign: 'center' },
    removePostButtonsContainer: { bottom: -25, zIndex: 1 },
    addPostButtonContainer: { position: 'absolute', end: -31, top: 50, width: '100%' },
    addHourButtonContainer: { position: 'absolute', top: -21, width: '100%' },
    addPostButton: { alignSelf: 'flex-end', overflow: 'visible' },
    addHourButton: { alignSelf: 'flex-start', overflow: 'visible' },
    removePostButton: {},
})
