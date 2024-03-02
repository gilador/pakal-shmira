import { memo } from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { TupleType } from "typescript";

export type NameCellViewProps = {
    availability: boolean
    index: [number, number]
    cb?: (availability: boolean, index: [number, number]) => void
}

const AvailabilityCellView = (props: NameCellViewProps) => {
    return (
        <TouchableOpacity onPress={()=>props.cb && props.cb(props.availability, props.index)} disabled={!props.cb}>
            <View style={getAvailabilityStyle(props.availability)} />
        </TouchableOpacity>
    );
}

function getAvailabilityStyle(availability: boolean): any[] {
    return [styles.container, availability ? styles.available : {}]

}

const styles = StyleSheet.create({
    container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: 'red' },
    available: { backgroundColor: 'green' }
});

export default memo(AvailabilityCellView)