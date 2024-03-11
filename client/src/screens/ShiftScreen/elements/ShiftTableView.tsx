import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import { StyleSheet, View } from 'react-native'
import React, { useMemo } from 'react'

import { IconButton } from 'react-native-paper'

import { getEmptyMatrix } from '@app/common/utils'
import NameCellView from './NameCellView'
import { User } from '../models'

type ShiftTableViewProp = {
    selectedNameId: string | undefined
    posts: (string | undefined)[]
    hours: string[]
    shifts?: User[][]
    isEditing?: boolean
}

const ShiftTableView = ({ selectedNameId, posts, hours, shifts, isEditing = false }: ShiftTableViewProp) => {
    const emptyCellsForSkeleton: User[][] = useMemo(() => {
        return getEmptyMatrix<User>(hours.length, posts.length - 1, {
            name: '',
            id: '',
        })
    }, [hours, posts])

    const shiftDataElements = useMemo(() => {
        let uiArray = (shifts ?? emptyCellsForSkeleton).map((array) =>
            array.map((user) => {
                return <NameCellView user={user.name} isDisable={true} isSelected={user.id === selectedNameId} />
            })
        )
        return uiArray
    }, [shifts, selectedNameId])

    const shitPostsRemoveElements = useMemo(() => {
        let uiArray = posts.map((post) => {
            console.log(`shiftDataElements->user.id:${post}, selectedNameId:${selectedNameId}`)
            const index = posts.find
            const cb = () => {
                posts = posts.filter((val) => val === post)
            }
            return <IconButton icon={'close-circle'} onPress={cb} />
        })
        return uiArray
    }, [posts])

    const flexHeadArray = useMemo(() => Array(posts.length).fill(1), [posts])

    return (
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
            <Table borderStyle={{ borderWidth: 1 }}>
                <Row data={posts} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
                <TableWrapper style={styles.wrapper}>
                    <Col data={hours} style={styles.title} textStyle={styles.text} />
                    <Rows
                        data={shiftDataElements}
                        flexArr={flexHeadArray.slice(0, -1)}
                        style={styles.row}
                        textStyle={styles.text}
                    />
                </TableWrapper>
            </Table>
        </View>
    )
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

export default ShiftTableView
