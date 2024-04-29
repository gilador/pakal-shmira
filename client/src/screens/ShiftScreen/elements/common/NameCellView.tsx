import { Pressable, StyleProp, StyleSheet, TextInput, ViewStyle } from 'react-native'
import React, { useEffect, useMemo, useRef } from 'react'

import withLogs from '@app/common/components/HOC/withLogs'
import { colors } from '@app/styles'

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
    const initVal = useRef<string>(user)
    const inputRef = useRef<TextInput>(null)

    user !== text && setText(user)

    if (!initVal.current) {
        initVal.current = user
    }

    const isAllowEdit = useMemo(() => {
        return editable ? 'auto' : 'none'
    }, [editable])

    useEffect(() => {
        isFocused && inputRef && inputRef?.current?.focus()
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
                placeholder={initVal.current}
                placeholderTextColor={colors.place_holder}
                selection={
                    isFocused && editable && text === initVal.current ? { start: 0, end: text.length } : undefined
                }
                onChangeText={(val: string) => {
                    setText(val)
                    onEdit && onEdit(val)
                    // }
                }}
                onBlur={() => {
                    if (text.length === 0) {
                        setText(initVal.current)
                        onEdit && onEdit(initVal.current)
                    }
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
        maxWidth: 70,
        alignSelf: 'center',
    },
    selected: { backgroundColor: colors.selected, borderRadius: 5, padding: 2 },
})

export default withLogs(NameCellView)
