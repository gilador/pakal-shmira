import React from 'react'
import { Pressable, StyleProp, StyleSheet, TextInput, ViewStyle } from 'react-native'

import withLogs from '@app/common/components/HOC/withLogs'

export type NameCellViewProps = {
    user: string
    isDisable?: boolean
    isSelected?: boolean
    cb?: () => void
    style?: StyleProp<ViewStyle>
    editable?: boolean
    onEdit?: (newText: string) => void
}

const NameCellView = ({ user, cb, isSelected = false, style, editable = false, onEdit }: NameCellViewProps) => {
    const [text, setText] = React.useState(user)
    user !== text && setText(user)
    return (
        <Pressable
            onPress={cb}
            onHoverIn={({ nativeEvent: MouseEvent }) => {}}
            style={[style, { minHeight: 20, justifyContent: 'center' }]}
        >
            <TextInput
                pointerEvents={editable ? 'auto' : 'none'}
                style={getTextStyle(isSelected)}
                value={text}
                onEndEditing={(e) => {
                    console.log(`onEndEditing e: ${e}`)
                }}
                onChangeText={(val: string) => {
                    setText(val)
                    onEdit && onEdit(val)
                }}
            />
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
        textAlign: 'center',
        verticalAlign: 'middle',
    },
    selected: { backgroundColor: 'pink' },
})

export default withLogs(NameCellView)
