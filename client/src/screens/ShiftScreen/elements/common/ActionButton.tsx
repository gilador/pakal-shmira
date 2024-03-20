import { IconSource } from 'react-native-paper/lib/typescript/components/Icon'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { IconButton } from 'react-native-paper'
import { memo } from 'react'
import React from 'react'

import { colors } from '@app/styles'

export enum IconType {
    close,
    add,
}
type CloseButtonProps = {
    type: IconType
    cb: () => void
    style?: StyleProp<ViewStyle>
}

const ActionButton = ({ type, cb, style }: CloseButtonProps) => {
    return (
        <IconButton
            icon={getIcon(type)}
            onPress={cb}
            style={[styles.container, style]}
            iconColor={getIconColors(type)}
        />
    )
}

//------------------------------------------functions--------------------------------------------------------

function getIcon(type: IconType): IconSource {
    switch (type) {
        case IconType.close:
            return 'minus-circle'
        case IconType.add:
            return 'plus-circle'
        default:
            throw new Error('Invalid icon type')
    }
}

function getIconColors(type: IconType): string | undefined {
    switch (type) {
        case IconType.close:
            return colors.remove
        case IconType.add:
            return colors.add
        default:
            return undefined
    }
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: { alignSelf: 'center' },
})

export default memo(ActionButton)
