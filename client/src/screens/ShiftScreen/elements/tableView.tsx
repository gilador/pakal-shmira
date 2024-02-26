import { useCallback, useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, TouchableWithoutFeedbackComponent, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Table, Row, Rows, TableWrapper, Col } from 'react-native-reanimated-table';

import { optimize } from "@app/services/optimizeService/OptimizieService";
import { ShiftBoard, UserAssigments, UserInfo } from "../models";
import { UserCell } from "@app/components/userCell";

type useGenerateShiftTableViewProp = {
  selectedNameId: string
  posts: string[]
  hours: string[]
  shifts: UserInfo[][]
}

export default function TableView({ selectedNameId, posts, hours, shifts }: useGenerateShiftTableViewProp) {
  console.log(`useTableView->selectedNameId:${JSON.stringify(selectedNameId)}`)
  // const [shiftData, setShiftData] = useState(getShiftBoardDataMock(names))

  const shiftDataElements = useMemo(() => {

    const uiArray = shifts.map((array) => array.map((user => {
      console.log(`val:m${JSON.stringify(user)}, selectedNameId: ${selectedNameId}`)
      return (
        <UserCell user={user} isSelected={user.id === selectedNameId}/>
      )
    })))
    return uiArray

  }, [[...shifts], selectedNameId])


  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={posts} flexArr={[1, 1, 1, 1, 1]} style={styles.head} textStyle={styles.text} />
        <TableWrapper style={styles.wrapper}>
          <Col data={hours} style={styles.title} textStyle={styles.text} />
          <Rows data={shiftDataElements} flexArr={[1, 1, 1, 1]} style={styles.row} textStyle={styles.text} />
        </TableWrapper>
      </Table>
    </View>
  )
}



const styles = StyleSheet.create({
  container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 50, backgroundColor: '#f1f8ff', textAlign: 'center' },
  title: { flex: 1, backgroundColor: '#f6f8fa' },
  row: { height: 50 },
  text: { textAlign: 'center' },
  wrapper: { flexDirection: 'row' },
});



