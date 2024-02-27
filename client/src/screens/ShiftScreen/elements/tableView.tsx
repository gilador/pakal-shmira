import { useCallback, useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, TouchableWithoutFeedbackComponent, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Table, Row, Rows, TableWrapper, Col } from 'react-native-reanimated-table';

import { optimize } from "@app/services/optimizeService/OptimizieService";
import { ShiftBoard, UserAssigments, UserInfo } from "../models";
import { UserCell } from "@app/components/userCell";
import { getEmptyCellsForSkeleton } from "../utils";

type useGenerateShiftTableViewProp = {
  selectedNameId: string
  posts: string[]
  hours: string[]
  shifts?: UserInfo[][]
}

export default function TableView({ selectedNameId, posts, hours, shifts }: useGenerateShiftTableViewProp) {
  console.log(`TableView->selectedNameId:${JSON.stringify(selectedNameId)}`)
  // const [shiftData, setShiftData] = useState(getShiftBoardDataMock(names))
  const emptyCellsForSkeleton: UserInfo[][] = useMemo(() => {
    return getEmptyCellsForSkeleton(hours.length, posts.length-1)
  },[hours, posts])

  const shiftDataElements = useMemo(() => {
    console.log(`TableView->useMemo->shifts:${JSON.stringify(shifts)}`)

    let uiArray = (shifts ?? emptyCellsForSkeleton).map((array) => array.map((user => {
      console.log(`TableView->val:m${JSON.stringify(user)}, selectedNameId: ${selectedNameId}`)
      return (
        <UserCell user={user} isSelected={user.id === selectedNameId}/>
      )
    })))
    return uiArray

  }, [[...shifts??[]], selectedNameId])

  const flexHeadArray = useMemo(()=>(Array(posts.length).fill(1)),[posts])

  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={posts} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
        <TableWrapper style={styles.wrapper}>
          <Col data={hours} style={styles.title} textStyle={styles.text} />
          <Rows data={shiftDataElements} flexArr={flexHeadArray.slice(0,-1)} style={styles.row} textStyle={styles.text} />
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



