import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View
} from "react-native";
import {
  Col,
  Row,
  Rows,
  Table,
  TableWrapper,
} from "react-native-reanimated-table";
import { getEmptyCellsForSkeleton } from "../utils";

import AvailabilityCellView from "../elements/AvailabilityCellView";

type useAvailabilityTableProp = {
  hours: string[];
  posts: string[];
  data: boolean[][];
};

export default function UseAvailabilityTable({
  posts,
  hours,
  data,
}: useAvailabilityTableProp) {

  const dataSkeleton: boolean[][] = useMemo(() => {
    return getEmptyCellsForSkeleton<boolean>(
      posts.length,
      hours.length - 1,
      true
    );
  }, [hours, posts]);

  console.log(`UseAvailabilityTable-> data: ${JSON.stringify(data)}, dataSkeleton: ${JSON.stringify(dataSkeleton)}`)
  
  const [userConstraint, setUserConstraint] = useState(dataSkeleton);


  const shiftDataElements = useMemo(() => {
    let uiArray = (userConstraint).map((array) =>
      array.map((availability) => {
        return <AvailabilityCellView availability={availability} />;
      })
    );
    return uiArray;
  }, [userConstraint]);

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
  constraint_allow: { backgroundColor: "green" },
  constraint_dis_allow: { backgroundColor: "red" },
});
