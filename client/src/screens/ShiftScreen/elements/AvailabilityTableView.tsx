import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  Col,
  Row,
  Rows,
  Table,
  TableWrapper,
} from "react-native-reanimated-table";
import { transposeMat } from "../../../common/utils";

import AvailabilityCellView from "./AvailabilityCellView";
import withLogs from "@app/components/HOC/withLogs";

type useAvailabilityTableProp = {
  hours: string[];
  posts: string[];
  availabilityData?: boolean[][];
  onConstraintsChanged: (data: boolean[][]) => void;
};

const AvailabilityTableView = ({
  posts,
  hours,
  availabilityData = [],
  onConstraintsChanged,
}: useAvailabilityTableProp) => {
  const flexHeadArray = useMemo(() => Array(posts.length).fill(1), [posts]);

  const transposedMatrix = useMemo(
    () => transposeMat(availabilityData),
    [availabilityData],
  );
  // const transposedMatrix = transposeMat(availabilityData);
  const cb = (availability: boolean, index: [number, number]) => {
    const newData = JSON.parse(JSON.stringify(availabilityData));
    newData[index[0]][index[1]] = !availability;
    onConstraintsChanged(newData);
  };

  const shiftDataElements = transposedMatrix.map((array, postIndex) =>
    array.map((availability, hourIndex) => {
      return (
        <AvailabilityCellView
          availability={availability}
          index={[postIndex, hourIndex]}
          cb={cb}
        />
      );
    }),
  );

  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row
          data={posts}
          flexArr={flexHeadArray}
          style={styles.head}
          textStyle={styles.text}
        />
        <TableWrapper style={styles.wrapper}>
          <Col data={hours} style={styles.title} textStyle={styles.text} />
          <Rows
            data={shiftDataElements}
            flexArr={flexHeadArray.slice(0, -1)}
            style={styles.row}
            textStyle={styles.text}
          />
        </TableWrapper>
      </Table>
    </View>
  );
};

//------------------------------------------functions--------------------------------------------------------

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 50, backgroundColor: "#f1f8ff", textAlign: "center" },
  title: { flex: 1, backgroundColor: "#f6f8fa" },
  row: { height: 50 },
  text: { textAlign: "center" },
  wrapper: { flexDirection: "row" },
});

export default withLogs(AvailabilityTableView);
