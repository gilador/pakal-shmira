import { Pressable, StyleSheet, View } from 'react-native'
import { memo, useState } from 'react'

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
        >
            <View style={getAvailabilityStyle(props.availability, opacity)} />
        </Pressable>
    )
}

//------------------------------------------functions--------------------------------------------------------

function getAvailabilityStyle(availability: boolean, opacity: number): any[] {
    return [styles.container, availability ? styles.available : {}, { opacity: opacity }]
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        backgroundColor: 'red',
    },
    available: { backgroundColor: 'green' },
    hover: { backgroundColor: 'pink' },
})

export default memo(AvailabilityCellView)
