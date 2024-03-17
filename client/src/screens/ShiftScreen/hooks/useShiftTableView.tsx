import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import React, { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { IconButton } from 'react-native-paper'

import { getEmptyMatrix, getUniqueString } from '@app/common/utils'
import { OptimizeShiftResponse } from '@app/services/api/models'
import NameCellView from '../elements/NameCellView'
import { UniqueString, User } from '../models'

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

    // const [userShiftData, setUserShiftData] = useState<UserShiftData[]>()
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
        console.log(`useShiftTableView->useMemo-> shifts:${JSON.stringify(shifts)}`)

        let uiArray = (shifts ?? emptyCellsForSkeleton).map((array) =>
            array.map((user) => {
                return <NameCellView user={user.name} isDisable={true} isSelected={user.id === selectedNameId} />
            })
        )
        return uiArray
    }, [shifts, selectedNameId, posts])

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

    const postsElements = useMemo(() => [undefined, ...posts].map((post) => post?.value ?? ''), [posts])
    const hoursElements = useMemo(() => hours.map((post) => post.value), [hours])
    const flexHeadArray = useMemo(() => Array(postsElements.length).fill(1), [posts])
    const shitPostsRemoveElements = useMemo(() => {
        let uiArray = [undefined, ...posts].map((post) => {
            if (post === undefined) return
            console.log(`shiftDataElements->user.id:${post}, selectedNameId:${selectedNameId}`)
            const cb = () => {
                setPosts((pre) => {
                    return pre.length > 1 ? pre.filter((val) => val !== post) : pre
                })
            }
            return <IconButton icon={'close-circle'} onPress={cb} />
        })
        return uiArray
    }, [posts])
    const ShiftTableView = memo(() => (
        <View style={styles.container}>
            {isEditing && (
                <TableWrapper borderStyle={{ borderWidth: 4, borderColor: 'white' }}>
                    <Row
                        data={shitPostsRemoveElements}
                        flexArr={flexHeadArray.slice(0, -2)}
                        style={styles.head2}
                        textStyle={styles.text}
                    />
                </TableWrapper>
            )}
            <Table borderStyle={{ borderWidth: 1 }}>
                <Row data={postsElements} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
                <TableWrapper style={styles.wrapper}>
                    <Col data={hoursElements} style={styles.title} textStyle={styles.text} />
                    <Rows
                        data={shiftDataElements}
                        flexArr={flexHeadArray.slice(0, -1)}
                        style={styles.row}
                        textStyle={styles.text}
                    />
                </TableWrapper>
            </Table>
        </View>
    ))

    return {
        posts,
        hours,
        isOptimized,
        ShiftTableView,
        onOptimize,
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
    head: { height: 50, backgroundColor: '#f1f8ff', textAlign: 'center' },
    title: { flex: 1, backgroundColor: '#f6f8fa' },
    row: { height: 50 },
    text: { textAlign: 'center' },
    wrapper: { flexDirection: 'row' },
})
