import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import React, { ReactNode, memo, useMemo } from 'react'

import ActionButton, { IconType } from '@app/common/components/ActionButton'

type TableViewProp = {
    verticalHeaderViews: (ReactNode | undefined)[]
    horizontalHeaderViews: (ReactNode | undefined)[]
    tableElementViews?: ReactNode[][]
    style?: StyleProp<ViewStyle>
    enableEdit?: boolean
    onHeaderRemove?: (index: number) => any
    onHeaderAdd?: (headerName: string) => any
    onSideHeaderRemove?: (index: number) => any
    onSideHeaderAdd?: (headerName: string) => any
}

const TableView = ({
    horizontalHeaderViews,
    verticalHeaderViews,
    tableElementViews,
    style,
    enableEdit,
    onHeaderRemove,
    onHeaderAdd,
    onSideHeaderRemove,
    onSideHeaderAdd,
}: TableViewProp) => {
    const sideHeaders = useMemo(() => {
        return enableEdit && onHeaderRemove
            ? verticalHeaderViews.map((header, index) => {
                  return removableHeaderCell(header, () => onHeaderRemove(index), styles.removeSideTopHeader)
              })
            : verticalHeaderViews
    }, [enableEdit, verticalHeaderViews])
    const topHeaders = useMemo(() => {
        const adaptedHorizontalHeaderViews = [undefined, ...horizontalHeaderViews]
        return enableEdit && onSideHeaderRemove
            ? adaptedHorizontalHeaderViews.map((header, index) => {
                  return removableHeaderCell(header, () => onSideHeaderRemove(index - 1), styles.removeTopHeader)
              })
            : adaptedHorizontalHeaderViews
    }, [enableEdit, horizontalHeaderViews])
    const flexHeadArray = useMemo(() => Array(topHeaders.length).fill(1), [topHeaders])

    return (
        <View style={[styles.container, style]}>
            <View style={{ flexDirection: 'row', width: '100%' }}>
                <Table style={{ flex: 20 }} borderStyle={{ borderWidth: 1 }}>
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
                {enableEdit && onHeaderAdd && <ActionButton type={IconType.add} cb={() => onHeaderAdd('עמדה חדשה')} />}
            </View>
            {enableEdit && onSideHeaderAdd && (
                <ActionButton
                    style={styles.addHourButton}
                    type={IconType.add}
                    cb={() => onSideHeaderAdd('עמדה חדשה')}
                />
            )}
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
        <View style={{ overflow: 'visible', alignSelf: 'stretch' }}>
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
    removeTopHeader: { position: 'absolute', overflow: 'visible' },
    removeSideTopHeader: { position: 'absolute', overflow: 'visible' },
    addHourButton: { alignSelf: 'flex-start' },
})

export default memo(TableView)
