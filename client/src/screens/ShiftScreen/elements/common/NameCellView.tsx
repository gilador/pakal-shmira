import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import React, { memo } from 'react'

import withLogs from '@app/common/components/HOC/withLogs'

export type NameCellViewProps = {
    user: string
    isDisable?: boolean
    isSelected?: boolean
    cb?: () => void
    style?: StyleProp<ViewStyle>
}

const NameCellView = ({ user, cb, isDisable = false, isSelected = false, style }: NameCellViewProps) => {
    return (
        <Pressable onPress={cb} disabled={isDisable} onHoverIn={({ nativeEvent: MouseEvent }) => {}} style={style}>
            <Text style={getTextStyle(isSelected)}>{user}</Text>
        </Pressable>
    )
}

//------------------------------------------functions--------------------------------------------------------

function getTextStyle(isSelected: boolean): any[] {
    return [styles.title, isSelected ? styles.selected : {}]
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    title: {
        padding: 7,
        textAlign: 'center',
        verticalAlign: 'middle',
        height: '100%',
    },
    selected: { backgroundColor: 'pink' },
})

export default memo(withLogs(NameCellView))
