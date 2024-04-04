import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import React, { ReactNode, memo, useMemo } from 'react'

import ActionButton, { IconType } from '@app/common/components/ActionButton'

type TableViewProp = {
    verticalHeaderViews: (ReactNode | undefined)[]
    horizontalHeaderViews: (ReactNode | undefined)[]
    tableElementViews?: ReactNode[][]
    hideGrid?: boolean
    style?: StyleProp<ViewStyle>
    enableEdit?: boolean
    onRemoveHeader?: (index: number) => any
    onRemoveSideHeader?: (index: number) => any
}

const TableView = ({
    horizontalHeaderViews,
    verticalHeaderViews,
    tableElementViews,
    style,
    hideGrid,
    enableEdit,
    onRemoveHeader,
    onRemoveSideHeader,
}: TableViewProp) => {
    const sideHeaders = useMemo(() => {
        return enableEdit && onRemoveSideHeader
            ? verticalHeaderViews.map((header, index) => {
                  return removableHeaderCell(header, () => onRemoveSideHeader(index), styles.removeSideTopHeader)
              })
            : verticalHeaderViews
    }, [enableEdit, verticalHeaderViews])
    const topHeaders = useMemo(() => {
        return enableEdit && onRemoveHeader
            ? horizontalHeaderViews.map((header, index) => {
                  return removableHeaderCell(header, () => onRemoveHeader(index), styles.removeTopHeader)
              })
            : horizontalHeaderViews
    }, [enableEdit, horizontalHeaderViews])
    const flexHeadArray = useMemo(() => Array(topHeaders.length).fill(1), [topHeaders])

    return (
        <View style={[styles.container, style]}>
            <Table borderStyle={!hideGrid ? { borderWidth: 1 } : {}}>
                <Row data={topHeaders} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
                <TableWrapper style={styles.wrapper}>
                    <Col data={sideHeaders} style={styles.title} textStyle={styles.text} />
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
function removableHeaderCell(
    wrappedComponent: ReactNode,
    onRemove: () => void,
    style: StyleProp<ViewStyle>
): ReactNode {
    return wrappedComponent ? (
        <View style={{ overflow: 'visible', position: 'absolute', alignSelf: 'center' }}>
            {wrappedComponent}
            <ActionButton type={IconType.close} cb={onRemove} style={style} />
        </View>
    ) : (
        <View />
    )
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: { paddingTop: 0 },
    head: { minHeight: 40, textAlign: 'center', overflow: 'visible' },
    title: { flex: 1 },
    text: { textAlign: 'center' },
    row: { minHeight: 30, textAlign: 'center' },
    wrapper: { flexDirection: 'row' },
    removeTopHeader: { position: 'absolute', top: -20, overflow: 'visible' },
    removeSideTopHeader: { position: 'absolute', left: -20, overflow: 'visible' },
})

export default memo(TableView)
