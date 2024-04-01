import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import React, { MemoExoticComponent, ReactNode, memo, useMemo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import withLogs from '@app/common/components/HOC/withLogs'
import { UniqueString } from '../../models'

type TableViewProp = {
    verticalHeaderViews: ReactNode[] | (() => ReactNode)[]
    horizontalHeaderViews: ReactNode[] | (() => ReactNode)[]
    tableElementViews?: ReactNode[][] | (() => ReactNode)[][]
    style?: StyleProp<ViewStyle>
}

const TableView = ({ horizontalHeaderViews, verticalHeaderViews, tableElementViews, style }: TableViewProp) => {
    // const postsElements = useMemo(() => [undefined, ...posts].map((post) => post?.value ?? ''), [posts])
    // const hoursElements = useMemo(() => hours.map((post) => post.value), [hours])
    const flexHeadArray = useMemo(() => Array(horizontalHeaderViews.length).fill(1), [horizontalHeaderViews])

    return (
        <View style={[styles.container, style]}>
            <Table borderStyle={{ borderWidth: 1 }} style={{ overflow: 'visible' }}>
                <Row data={horizontalHeaderViews} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
                <TableWrapper style={styles.wrapper}>
                    <Col data={verticalHeaderViews} style={styles.title} textStyle={styles.text} />
                    {tableElementViews && (
                        <Rows
                            data={tableElementViews}
                            flexArr={flexHeadArray.slice(0, -1)}
                            style={styles.row}
                            textStyle={styles.text}
                        />
                    )}
                </TableWrapper>
            </Table>
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#00FF0000',
        overflow: 'visible',
    },
    head: { height: 50, backgroundColor: '#00FF0000', textAlign: 'center', overflow: 'visible' },
    title: { flex: 1, backgroundColor: '#00FF0000' },
    text: { textAlign: 'center' },
    row: { height: 50 },
    wrapper: { flexDirection: 'row' },
})

export default memo(TableView)
