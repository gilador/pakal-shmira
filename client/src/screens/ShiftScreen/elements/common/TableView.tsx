import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import React, { MemoExoticComponent, ReactNode, memo, useMemo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import withLogs from '@app/common/components/HOC/withLogs'
import { UniqueString } from '../../models'

type TableViewProp = {
    hours: UniqueString[]
    posts: UniqueString[]
    uiArray: ReactNode[][] | (() => React.JSX.Element)[][]
    style?: StyleProp<ViewStyle>
}

const TableView = ({ posts, hours, uiArray, style }: TableViewProp) => {
    const postsElements = useMemo(() => [undefined, ...posts].map((post) => post?.value ?? ''), [posts])
    const hoursElements = useMemo(() => hours.map((post) => post.value), [hours])
    const flexHeadArray = useMemo(() => Array(postsElements.length).fill(1), [posts])

    return (
        <View style={[styles.container, style]}>
            <Table borderStyle={{ borderWidth: 1 }}>
                <Row data={postsElements} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
                <TableWrapper style={styles.wrapper}>
                    <Col data={hoursElements} style={styles.title} textStyle={styles.text} />
                    <Rows
                        data={uiArray}
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
        backgroundColor: '#fff',
    },
    head: { height: 50, backgroundColor: '#f1f8ff', textAlign: 'center' },
    title: { flex: 1, backgroundColor: '#f6f8fa' },
    row: { height: 50 },
    text: { textAlign: 'center' },
    wrapper: { flexDirection: 'row' },
})

export default memo(TableView)
