import { Col, Row, Rows, Table, TableWrapper } from 'react-native-reanimated-table'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import React, { ReactNode, memo, useMemo } from 'react'

import ActionButton, { IconType } from '@app/common/components/ActionButton'

type TableViewProp = {
    verticalHeaderViews: (ReactNode | undefined)[]
    horizontalHeaderViews: (ReactNode | undefined)[]
    tableElementViews?: ReactNode[][]
    style?: StyleProp<ViewStyle>
    isEditing?: boolean
    onColRemove?: (index: number) => any
    onColAdd?: () => any
    onRowRemove?: (index: number) => any
    onRowAdd?: () => any
}

const TableView = ({
    horizontalHeaderViews,
    verticalHeaderViews,
    tableElementViews,
    style,
    isEditing,
    onColRemove,
    onColAdd,
    onRowRemove,
    onRowAdd,
}: TableViewProp) => {
    const sideHeaders = useMemo(() => {
        return isEditing && onRowRemove
            ? verticalHeaderViews.map((header, index) => {
                  const canBeRemoved = verticalHeaderViews.length > 1
                  return removableHeaderCell(header, () => onRowRemove(index), styles.removeSideTopHeader, canBeRemoved)
              })
            : verticalHeaderViews
    }, [isEditing, verticalHeaderViews])

    const topHeaders = useMemo(() => {
        const adaptedHorizontalHeaderViews = [undefined, ...horizontalHeaderViews]
        return isEditing && onColRemove
            ? adaptedHorizontalHeaderViews.map((header, index) => {
                  const canBeRemoved = horizontalHeaderViews.length > 1
                  return removableHeaderCell(header, () => onColRemove(index - 1), styles.removeTopHeader, canBeRemoved)
              })
            : adaptedHorizontalHeaderViews
    }, [isEditing, horizontalHeaderViews])

    const flexHeadArray = useMemo(() => Array(topHeaders.length).fill(1), [topHeaders])

    const topHeadersWidth = topHeaders.length * 150

    return (
        <View style={[styles.container, style]}>
            {onColAdd && (
                <ActionButton
                    style={[styles.addTopHeaderButton, !isEditing ? styles.hide : undefined]}
                    type={IconType.addCol}
                    cb={() => onColAdd()}
                    enabled={isEditing}
                />
            )}
            <View style={{ flexDirection: 'row', width: topHeadersWidth }}>
                {onRowAdd && (
                    <ActionButton
                        style={[styles.addSideHeaderButton, !isEditing ? styles.hide : undefined]}
                        type={IconType.addRow}
                        cb={() => onRowAdd()}
                        enabled={isEditing}
                    />
                )}
                <Table style={{ flex: 20 }} borderStyle={{ borderWidth: 1 }}>
                    <Row data={topHeaders} style={[styles.head]} textStyle={styles.text} />
                    <TableWrapper style={[styles.wrapper]}>
                        <Col data={sideHeaders} style={[styles.title]} textStyle={styles.text} />
                        {tableElementViews && (
                            <Rows
                                data={tableElementViews}
                                flexArr={flexHeadArray.slice(0, -1)}
                                style={[styles.row]}
                                textStyle={styles.text}
                            />
                        )}
                    </TableWrapper>
                </Table>
            </View>
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------
function removableHeaderCell(
    wrappedComponent: ReactNode,
    onRemove: () => void,
    style: StyleProp<ViewStyle>,
    canBeRemoved: boolean,
    allowFocus: boolean = false,
    forceFocus: boolean = false
): ReactNode {
    return wrappedComponent ? (
        <View style={{ overflow: 'visible', alignSelf: 'stretch' }}>
            {wrappedComponent}
            <ActionButton type={IconType.close} cb={onRemove} style={style} enabled={canBeRemoved} />
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
    addTopHeaderButton: { alignSelf: 'flex-start', paddingStart: 30, paddingBottom: 5 },
    addSideHeaderButton: { alignSelf: 'flex-start', paddingTop: 30, paddingEnd: 5 },
    hide: { opacity: 0 },
})

export default memo(TableView)
