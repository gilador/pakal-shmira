import {
    Col,
    Row,
    Rows,
    Table,
    TableWrapper,
} from 'react-native-reanimated-table'
import React, { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { IconButton } from 'react-native-paper'

import { boolean } from 'mathjs'

import { OptimizeShiftResponse } from '@app/services/api/models'
import { ShiftBoard, User, UserShiftData } from '../models'
import NameCellView from '../elements/NameCellView'
import { getEmptyMatrix } from '@app/common/utils'

export default function useShiftTableView(
    selectedNameId: string | undefined,
    isEditing = false,
    names: User[],
    optimize: (constraints: boolean[][][]) => Promise<OptimizeShiftResponse>,
    constraints?: boolean[][][]
) {
    const [posts, setPosts] = useState<(string | undefined)[]>([
        undefined,
        'ש.ג1',
        'ש.ג2',
        'מערבי',
        'מזרחי',
    ])
    const [hours, setHours] = useState<string[]>([
        '0600-1000',
        '1000-1400',
        '1400-1600',
        '1600-2000',
        '2000-2400',
        '0000-0400',
    ])
    // const [userShiftData, setUserShiftData] = useState<UserShiftData[]>()
    const [shifts, setShifts] = useState<User[][] | undefined>()
    console.log(`useShiftTableView-> shifts:${JSON.stringify(shifts)}`)
    const [isOptimized, setIsOptimized] = React.useState<boolean>(false)

    const emptyCellsForSkeleton: User[][] = useMemo(() => {
        return getEmptyMatrix<User>(hours.length, posts.length - 1, {
            name: '',
            id: '',
        })
    }, [hours, posts])

    const shiftDataElements = useMemo(() => {
      console.log(`useShiftTableView->useMemo-> shifts:${JSON.stringify(shifts)}`)

        let uiArray = (shifts ?? emptyCellsForSkeleton).map((array) =>
            array.map((user) => {
                return (
                    <NameCellView
                        user={user.name}
                        isDisable={true}
                        isSelected={user.id === selectedNameId}
                    />
                )
            })
        )
        return uiArray
    }, [shifts, selectedNameId])

    const shitPostsRemoveElements = useMemo(() => {
        let uiArray = posts.map((post) => {
            console.log(
                `shiftDataElements->user.id:${post}, selectedNameId:${selectedNameId}`
            )
            const cb = () => {
                setPosts((pre) => pre.filter((val) => val === post))
            }
            return <IconButton icon={'close-circle'} onPress={cb} />
        })
        return uiArray
    }, [posts])

    const flexHeadArray = useMemo(() => Array(posts.length).fill(1), [posts])

    const onOptimize = useCallback(async () => {
        if (!constraints) {
            return //todo throw
        }

        try {
            // Optimize user shifts asynchronously
            const optimizedShift: OptimizeShiftResponse =
                await optimize(constraints)

            {
                //TODO validate response
            }

            setIsOptimized(optimizedShift.isOptim)
            // Update shift data

            const shifts = getEmptyMatrix<User>(
                hours.length,
                posts.length - 1,
                { name: '', id: '' }
            )

            optimizedShift.result.forEach((userShift, userIndex) => {
                // let total = 0
                userShift.forEach((hourArray, hourIndex) => {
                    hourArray.forEach((post, postIndex) => {
                        if (post) {
                            shifts[postIndex][hourIndex] = names[userIndex]
                            console.log(
                                `onOptimize->foreach->userIndex: ${userIndex}, postIndex:${postIndex}, hourIndex:${hourIndex}, names[userIndex]: ${JSON.stringify(names[userIndex])}`
                            )
                            // total++
                        }
                    })
                })
                // userShift.totalAssignments = total
            })
            setShifts(shifts)
        } catch (error) {
            console.error('Error occurred while optimizing shifts:', error)
            // Handle error appropriately, e.g., show error message to the user
        }
    }, [constraints, names])

    const ShiftTableView = memo(() => (
        <View style={styles.container}>
            {isEditing && (
                <TableWrapper
                    borderStyle={{ borderWidth: 4, borderColor: 'white' }}
                >
                    <Row
                        data={shitPostsRemoveElements}
                        flexArr={flexHeadArray}
                        style={styles.head2}
                        textStyle={styles.text}
                    />
                </TableWrapper>
            )}
            <Table borderStyle={{ borderWidth: 1 }}>
                <Row
                    data={posts}
                    flexArr={flexHeadArray}
                    style={styles.head}
                    textStyle={styles.text}
                />
                <TableWrapper style={styles.wrapper}>
                    <Col
                        data={hours}
                        style={styles.title}
                        textStyle={styles.text}
                    />
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
