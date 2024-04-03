import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import React, { ReactNode, memo, useMemo } from 'react'

type TableViewProp = {
    verticalHeaderViews: (ReactNode | React.JSX.Element)[] | (() => ReactNode | React.JSX.Element)[]
    horizontalHeaderViews: (ReactNode | React.JSX.Element)[] | (() => ReactNode | React.JSX.Element)[]
    tableElementViews?: (ReactNode | React.JSX.Element)[][] | (() => ReactNode | React.JSX.Element)[][]
    hideGrid?: boolean
    style?: StyleProp<ViewStyle>
}

const TableView = ({ horizontalHeaderViews, verticalHeaderViews, tableElementViews, style, hideGrid }: TableViewProp) => {
    const flexHeadArray = useMemo(() => Array(horizontalHeaderViews.length).fill(1), [horizontalHeaderViews])

    return (
        <View style={[styles.container, style]}>
            <Table borderStyle={!hideGrid ? { borderWidth: 1 } : {}}>
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
    container: { paddingTop: 0 },
    head: { minHeight: 40, textAlign: 'center', overflow: 'visible' },
    title: { flex: 1 },
    text: { textAlign: 'center' },
    row: { minHeight: 30, textAlign: 'center' },
    wrapper: { flexDirection: 'row' },
})

export default memo(TableView)
