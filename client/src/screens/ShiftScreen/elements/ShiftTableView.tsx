import { useCallback, useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, TouchableWithoutFeedbackComponent, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Table, Row, Rows, TableWrapper, Col } from 'react-native-reanimated-table';

import { ShiftBoard, UserAssigments, UserInfo } from "../models";
import { getEmptyCellsForSkeleton } from "../utils";
import NameCellView from "./NameCellView";

type ShiftTableViewProp = {
  selectedNameId: string
  posts: string[]
  hours: string[]
  shifts?: UserInfo[][]
}

export default function ShiftTableView({ selectedNameId, posts, hours, shifts }: ShiftTableViewProp) {
  const emptyCellsForSkeleton: UserInfo[][] = useMemo(() => {
    return getEmptyCellsForSkeleton<UserInfo>(hours.length, posts.length - 1, { name: "", id: "" })
  }, [hours, posts])

  const shiftDataElements = useMemo(() => {
    let uiArray = (shifts ?? emptyCellsForSkeleton).map((array) => array.map((user => {
      return (
        <NameCellView user={user} isSelected={user.id === selectedNameId} />
      )
    })))
    return uiArray

  }, [shifts, selectedNameId])

  // const constraintDataElements = useMemo(() => {
  //   if (!constraints){
  //     return undefined
  //   }
  //   let uiArray = constraints.map((array) => array.map((constraints => {
  //     // console.log(`TableView->val:m${JSON.stringify(user)}, selectedNameId: ${selectedNameId}`)
  //     return (
  //       <View style={styles.constraint_allow}/>
  //     )
  //   })))
  //   return uiArray
  // },[constraints])
  const flexHeadArray = useMemo(() => (Array(posts.length).fill(1)), [posts])

  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={posts} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
        <TableWrapper style={styles.wrapper}>
          <Col data={hours} style={styles.title} textStyle={styles.text} />
          <Rows data={shiftDataElements} flexArr={flexHeadArray.slice(0, -1)} style={styles.row} textStyle={styles.text} />
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
  constraint_allow: { backgroundColor: 'green' },
  constraint_dis_allow: { backgroundColor: 'red' }
});



