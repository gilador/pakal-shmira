import { memo } from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";

export type NameCellViewProps = {
    avilablity: boolean
    cb?: () => void
}

const AvilabilityTableView = (props: NameCellViewProps) => {
    return (
        <TouchableOpacity onPress={props.cb} disabled={!props.cb}>
            <View style={getAvilablityStyle(props.avilablity)} />
        </TouchableOpacity>
    );
}

function getAvilablityStyle(avilablity: boolean): any[] {
    return [styles.container, avilablity ? styles.avilable : {}]

}

const styles = StyleSheet.create({
    container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: 'red' },
    avilable: { backgroundColor: 'green' }
});

export default memo(AvilabilityTableView)