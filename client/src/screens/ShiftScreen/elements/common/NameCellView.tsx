import { Pressable, StyleProp, StyleSheet, TextInput, ViewStyle } from 'react-native'
import React, { useEffect, useMemo, useRef } from 'react'

import withLogs from '@app/common/components/HOC/withLogs'

export type NameCellViewProps = {
    cb?: () => void
    onEdit?: (newText: string) => void
    user: string
    isSelected?: boolean
    isFocused?: boolean
    editable?: boolean
    style?: StyleProp<ViewStyle>
}

const NameCellView = ({
    user,
    isSelected = false,
    style,
    editable = false,
    isFocused = false,
    onEdit,
    cb,
}: NameCellViewProps) => {
    const [text, setText] = React.useState(user)
    const inputRef = useRef<TextInput | null>(null)

    user !== text && setText(user)
    const isAllowEdit = useMemo(() => {
        return editable ? 'auto' : 'none'
    }, [])

    useEffect(() => {
        isFocused && inputRef && inputRef?.current?.focus()
        // isFocused && inputRef.current && inputRef?.current?.setSelection(0, 1)
    }, [])

    return (
        <Pressable
            onPress={cb}
            onHoverIn={({ nativeEvent: MouseEvent }) => {}}
            style={[style, { minHeight: 20, justifyContent: 'center' }]}
        >
            <TextInput
                pointerEvents={isAllowEdit}
                style={getTextStyle(isSelected)}
                value={text}
                ref={inputRef}
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
