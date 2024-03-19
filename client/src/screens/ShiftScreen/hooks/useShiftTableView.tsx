import { Row, TableWrapper } from 'react-native-reanimated-table'
import { StyleSheet, View } from 'react-native'

import { IconButton } from 'react-native-paper'

import { getEmptyMatrix } from '@app/common/utils'
import { UniqueString, User } from '../models'

import { OptimizeShiftResponse } from '@app/services/api/models'
import React, { useState, useMemo, useCallback } from 'react'
import NameCellView from '../elements/common/NameCellView'
import TableView from '../elements/common/TableView'
import { getUniqueString } from '@app/common/utils'

export default function useShiftTableView(
    selectedNameId: string | undefined,
    isEditing = false,
    names: User[],
    optimize: () => Promise<OptimizeShiftResponse | undefined>
) {
    const [posts, setPosts] = useState<UniqueString[]>([
        getUniqueString('ש.ג1'),
        getUniqueString('ש.ג2'),
        getUniqueString('מערבי'),
        getUniqueString('מזרחי'),
    ])
    const [hours, setHours] = useState<UniqueString[]>([
        getUniqueString('0600-1000'),
        getUniqueString('1000-1400'),
        getUniqueString('1400-1600'),
        getUniqueString('1600-2000'),
        getUniqueString('2000-2400'),
        getUniqueString('0000-0400'),
    ])

    const [shifts, setShifts] = useState<User[][] | undefined>()
    console.log(`useShiftTableView-> shifts:${JSON.stringify(shifts)}`)
    const [isOptimized, setIsOptimized] = React.useState<boolean>(false)
    const emptyCellsForSkeleton: User[][] = useMemo(() => {
        return getEmptyMatrix<User>(hours.length, posts.length, {
            name: '',
            id: '',
        })
    }, [hours, posts])

    const shiftDataElements = useMemo(() => {
        let uiArray = (shifts ?? emptyCellsForSkeleton).map((array) =>
            array.map((user) => {
                return <NameCellView user={user.name} isDisable={true} isSelected={user?.id === selectedNameId} />
            })
        )
        return uiArray
    }, [shifts, emptyCellsForSkeleton, selectedNameId])

    const shitPostsRemoveElements = useMemo(() => {
        let uiArray = [undefined, ...posts].map((post, postIndex) => {
            if (!post) {
                return
            }
            console.log(`shiftDataElements->user.id:${post}, selectedNameId:${selectedNameId}`)
            const cb = () => {
                setPosts((pre) => pre.filter((val) => val?.id !== post?.id))
                removePostFromShifts(postIndex)
            }
            return <IconButton icon={'close-circle'} onPress={cb} />
        })
        return uiArray
    }, [posts])

    const flexHeadArray = useMemo(() => Array(posts.length).fill(1), [posts])

    const ShiftTable = (
        <View style={styles.container}>
            {isEditing && (
                <TableWrapper borderStyle={{ borderWidth: 4, borderColor: 'white' }}>
                    <Row
                        data={shitPostsRemoveElements}
                        flexArr={flexHeadArray}
                        style={styles.head2}
                        textStyle={styles.text}
                    />
                </TableWrapper>
            )}
            <TableView posts={posts} hours={hours} uiArray={shiftDataElements} />
        </View>
    )
    const onOptimize = useCallback(async () => {
        try {
            // Optimize user shifts asynchronously
            const optimizedShift = await optimize()

            if (!optimizedShift) {
                return
            }

            {
                //TODO validate response
            }

            setIsOptimized(optimizedShift.isOptim)
            // Update shift data

            const shifts = getEmptyMatrix<User>(hours.length, posts.length, { name: '', id: '' })

            optimizedShift.result.forEach((userShift, userIndex) => {
                userShift.forEach((hourArray, hourIndex) => {
                    hourArray.forEach((post, postIndex) => {
                        if (post) {
                            shifts[postIndex][hourIndex] = names[userIndex]
                            console.log(
                                `onOptimize->foreach->userIndex: ${userIndex}, postIndex:${postIndex}, hourIndex:${hourIndex}, names[userIndex]: ${JSON.stringify(names[userIndex])}`
                            )
                        }
                    })
                })
            })
            setShifts(shifts)
        } catch (error) {
            console.error('Error occurred while optimizing shifts:', error)
            // Handle error appropriately, e.g., show error message to the user
        }
    }, [names, optimize])

    return {
        posts,
        hours,
        isOptimized,
        ShiftTable,
        onOptimize,
    }

    function removePostFromShifts(postIndex: number) {
        setShifts((prevShifts) => {
            if (!prevShifts) return prevShifts;
            const newShifts = prevShifts.map((array) => {
                return array.filter((_, index) => index !== postIndex);
            });
            return newShifts;
        });
    }
}

//------------------------------------------functions--------------------------------------------------------

//------------------------------------------StyleSheet--------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 10,
        padding: 16,
        paddingTop: 30,
        backgroundColor: '#fff',
    },
    head2: {
        height: 50,
        backgroundColor: '#f1f8ff',
        borderRadius: 0,
        borderBlockColor: 'white',
    },
    text: { textAlign: 'center' },
})



