import { Pressable, StyleSheet, View } from 'react-native'
import { memo, useState } from 'react'

import { colors } from '@app/styles'

export type AvailabilityCellViewProps = {
    availability: boolean
    index: [number, number]
    cb?: (availability: boolean, index: [number, number]) => void
}

const AvailabilityCellView = (props: AvailabilityCellViewProps) => {
    const [opacity, setOpacity] = useState(1)

    return (
        <Pressable
            onHoverIn={() => {
                setOpacity(0.5)
            }}
            onHoverOut={() => {
                setOpacity(1)
            }}
            onPress={() => props.cb && props.cb(props.availability, [props.index[1], props.index[0]])}
            disabled={!props.cb}
            style={styles.container}
        >
            <View style={getAvailabilityStyle(props.availability, opacity)} />
        </Pressable>
    )
}

//------------------------------------------functions--------------------------------------------------------

function getAvailabilityStyle(availability: boolean, opacity: number): any[] {
    return [styles.container, availability ? styles.available : styles.uAvailable, { opacity: opacity }]
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    available: { backgroundColor: colors.available },
    uAvailable: { backgroundColor: colors.unavailable },
    hover: { backgroundColor: 'pink' },
})

export default memo(AvailabilityCellView)
