import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native'
import React from 'react'

import withLogs from './HOC/withLogs'
import { colors } from '../../styles'

export interface SplitScreenCompProps {
    leftPanel: JSX.Element
    rightPanel: JSX.Element
    style?: StyleProp<ViewStyle>
}

const SplitScreenComp = ({ leftPanel, rightPanel, style }: SplitScreenCompProps): JSX.Element => {
    const newRightPanel = React.cloneElement(rightPanel, {
        style: [styles.rightPanel, rightPanel.props.style],
    })
    const newLeftPanel = React.cloneElement(leftPanel, {
        style: styles.leftPanel,
    })

    return (
        <View style={[styles.container, style]}>
            {newLeftPanel}
            <View style={styles.separator} />
            {newRightPanel}
        </View>
    )
}

//------------------------------------------functions--------------------------------------------------------

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    leftPanel: {
        flex: 1,
    },
    separator: {
        backgroundColor: colors.border,
        flexBasis: 2,
        marginVertical: 60,
        marginHorizontal: 10,
    },
    rightPanel: {
        flexGrow: 5,
        flexShrink: 1,
    },
})

export default withLogs(SplitScreenComp)
