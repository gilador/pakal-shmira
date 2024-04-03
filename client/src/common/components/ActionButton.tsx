import { IconSource } from 'react-native-paper/lib/typescript/components/Icon'
import { memo, useLayoutEffect, useMemo, useState } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { IconButton } from 'react-native-paper'
import React from 'react'

import { colors } from '@app/styles'
import { View } from './Themed'

export enum IconType {
    close,
    add,
}
type CloseButtonProps = {
    type: IconType
    cb: () => void
    center?: boolean
    style?: StyleProp<ViewStyle>
}

const ActionButton = ({ type, cb, style, center = false }: CloseButtonProps) => {
    const [compDim, setCompDim] = useState<readonly [number, number]>([0, 0])
    const [comLeft, compTop] = useMemo(() => {
        return [compDim[0] / 2 - 5, compDim[1] / 2 - 5]
    }, [compDim])

    return (
        <View
            onLayout={(event) => {
                setCompDim([event.nativeEvent.layout.width, event.nativeEvent.layout.height])
            }}
            style={[style, { backgroundColor: 'transparent' }]}
        >
            <View style={[styles.whiteBackgroundFill, { left: comLeft, top: compTop }]} />
            <IconButton
                icon={getIcon(type)}
                onPress={cb}
                iconColor={getIconColors(type)}
                style={{ alignSelf: 'center' }}
            />
        </View>
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
    whiteBackgroundFill: {
        position: 'absolute',
        backgroundColor: 'white',
        width: 10,
        height: 10,
    },
})

export default memo(ActionButton)
