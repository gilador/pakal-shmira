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
    onColRemove?: (index: number) => any
    onColAdd?: (headerName: string) => any
    onRowRemove?: (index: number) => any
    onRowAdd?: (headerName: string) => any
}

const TableView = ({
    horizontalHeaderViews,
    verticalHeaderViews,
    tableElementViews,
    style,
    enableEdit,
    onColRemove,
    onColAdd,
    onRowRemove,
    onRowAdd,
}: TableViewProp) => {
    const sideHeaders = useMemo(() => {
        return enableEdit && onRowRemove
            ? verticalHeaderViews.map((header, index) => {
                  const canBeRemoved = verticalHeaderViews.length > 1
                  return removableHeaderCell(header, () => onRowRemove(index), styles.removeSideTopHeader, canBeRemoved)
              })
            : verticalHeaderViews
    }, [enableEdit, verticalHeaderViews])

    const topHeaders = useMemo(() => {
        const adaptedHorizontalHeaderViews = [undefined, ...horizontalHeaderViews]
        return enableEdit && onColRemove
            ? adaptedHorizontalHeaderViews.map((header, index) => {
                  const canBeRemoved = horizontalHeaderViews.length > 1
                  return removableHeaderCell(header, () => onColRemove(index - 1), styles.removeTopHeader, canBeRemoved)
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
                {enableEdit && onColAdd && <ActionButton type={IconType.add} cb={() => onColAdd('עמדה חדשה')} />}
            </View>
            {enableEdit && onRowAdd && (
                <ActionButton style={styles.addHourButton} type={IconType.add} cb={() => onRowAdd('שעה חדשה')} />
            )}
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------
function removableHeaderCell(
    wrappedComponent: ReactNode,
    onRemove: () => void,
    style: StyleProp<ViewStyle>,
    canBeRemoved: boolean
): ReactNode {
    return wrappedComponent ? (
        <View style={{ overflow: 'visible', alignSelf: 'stretch' }}>
            {wrappedComponent}
            <ActionButton type={IconType.close} cb={onRemove} style={style} enabled={canBeRemoved}/>
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
