import React, { memo, useMemo, useState } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { IconButton } from 'react-native-paper'
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon'
import AddCol from 'src/assets/svg/add-col.svg'
import AddRow from 'src/assets/svg/add-row.svg'


import { colors } from '@app/styles'
import { View } from './Themed'
import { re } from 'mathjs'

export enum IconType {
    close,
    add,
    addCol,
    addRow
}
type CloseButtonProps = {
    type: IconType
    cb: () => void
    center?: boolean
    style?: StyleProp<ViewStyle>
    enabled?: boolean
}

const ActionButton = ({ type, cb, style, center = false, enabled = true }: CloseButtonProps) => {
    const [compDim, setCompDim] = useState<readonly [number, number]>([0, 0])
    const [iconDim, setIconDim] = useState<readonly [number, number]>([0, 0])
    const [comLeft, compTop] = useMemo(() => {
        return [compDim[0] / 2 - 5, compDim[1] / 2 - 5]
    }, [compDim])

    return (
        <View
            onLayout={(event) => {
                setCompDim([event.nativeEvent.layout.width, event.nativeEvent.layout.height])
            }}
            style={[style, { backgroundColor: 'transparent' }, {alignItems: 'center', justifyContent: 'center'}]}
        >
            <View style={[styles.whiteBackgroundFill, {width:iconDim[1], height:iconDim[0]}]} />
            <IconButton
                onLayout={(event) => {
                    setIconDim([event.nativeEvent.layout.width, event.nativeEvent.layout.height])
                }}
                icon={getIcon(type)}
                onPress={cb}
                containerColor={getIconBackgroundColor(type)}
                iconColor={getIconColor(type)}
                style={styles.icon}
                disabled={!enabled}
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
        case IconType.addCol:
            return AddCol
        case IconType.addRow:
            return AddRow
        default:
            throw new Error('Invalid icon type')
    }
}

function getIconColor(type: IconType): string | undefined {
    switch (type) {
        case IconType.close:
            return colors.remove
        case IconType.add:
            return colors.add
        case IconType.addCol:
        case IconType.addRow:
            return colors.add
        default:
            return undefined
    }
}
function getIconBackgroundColor(type: IconType): string | undefined {
    switch (type) {
        case IconType.addCol:
        case IconType.addRow:
            return colors.white
        default:
            return undefined
    }
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    whiteBackgroundFill: {
        position: 'absolute',
        backgroundColor: 'white',
        width: 'auto',
        height: 'auto',
        borderRadius: 100,
        alignSelf:'center'
        
    },
    icon: { width: 'auto', height: 'auto', margin: 0, padding: 0 },
})

export default memo(ActionButton)
