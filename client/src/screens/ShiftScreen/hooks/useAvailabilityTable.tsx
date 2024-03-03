import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Col,
  Row,
  Rows,
  Table,
  TableWrapper,
} from "react-native-reanimated-table";
import { getEmptyMatrix, transposeMat } from "../utils";

import AvailabilityCellView from "../elements/AvailabilityCellView";

type useAvailabilityTableProp = {
  hours: string[];
  posts: string[];
  data: boolean[][];
  onConstraintsChanged: (data: boolean[][]) => void;
};

export default function UseAvailabilityTable({
  posts,
  hours,
  data,
  onConstraintsChanged,
}: useAvailabilityTableProp) {
  const transposedMatrix = transposeMat(data);
  // const transposedMatrix  = useMemo(() => {
  //   console.log(`UseAvailabilityTable-> transposedMatrix: prev:${JSON.stringify(transposedMatrix)}`)
  //   return transposeMat(data)
  // }, [data]);
  // console.log(`render-> UseAvailabilityTable: data: ${JSON.stringify(data)}`)

  // const [userConstraint, setUserConstraint] = useState(transposeMat(data));
  // console.log(`gilad-> userConstraint: ${JSON.stringify(userConstraint)}`);

  const cb = (availability: boolean, index: [number, number]) => {
    console.log(`gilad-> availability:${availability} index:${index}:`);
    const newData = JSON.parse(JSON.stringify(data))
    newData[index[0]][index[1]] = !availability;
    console.log(
      `gilad-> pre[index[0]][index[1]:${
        newData[index[0]][index[1]]
      }: pre:${JSON.stringify(newData)}`
    );
    onConstraintsChanged((newData));
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
    })
  );

  const flexHeadArray = useMemo(() => Array(posts.length).fill(1), [posts]);
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
}

const styles = StyleSheet.create({
  container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: "#fff" },
  head: { height: 50, backgroundColor: "#f1f8ff", textAlign: "center" },
  title: { flex: 1, backgroundColor: "#f6f8fa" },
  row: { height: 50 },
  text: { textAlign: "center" },
  wrapper: { flexDirection: "row" },
});
