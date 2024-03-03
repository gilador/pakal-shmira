import withLogs from "@app/components/HOC/withLogs";
import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export type NameCellViewProps = {
  availability: boolean;
  index: [number, number];
  cb?: (availability: boolean, index: [number, number]) => void;
};

const AvailabilityCellView = (props: NameCellViewProps) => {
  return (
    <TouchableOpacity
      onPress={() =>
        props.cb &&
        props.cb(props.availability, [props.index[1], props.index[0]])
      }
      disabled={!props.cb}
    >
      <View style={getAvailabilityStyle(props.availability)} />
    </TouchableOpacity>
  );
};

//------------------------------------------functions--------------------------------------------------------

function getAvailabilityStyle(availability: boolean): any[] {
  return [styles.container, availability ? styles.available : {}];
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: "red" },
  available: { backgroundColor: "green" },
});

export default memo(withLogs(AvailabilityCellView))
