import { IconButton } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { colors } from '@app/styles'
import { memo } from 'react'
import React from 'react'

type CloseButtonProps = {
    cb: () => void
}

const CloseButton = ({ cb } : CloseButtonProps) => {
    return <IconButton icon={'close-circle'} onPress={cb} style={styles.removeButton} iconColor={colors.red_form} />
}

const styles = StyleSheet.create({
    removeButton: { alignSelf: 'center', tintColor: 'red' },
})

export default memo(CloseButton)
