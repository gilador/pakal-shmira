import { useCallback, useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, TouchableWithoutFeedbackComponent, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Table, Row, Rows, TableWrapper, Col } from 'react-native-reanimated-table';

import { ShiftBoard, UserShiftData, User } from "../models";
import { getEmptyCellsForSkeleton } from "../utils";
import AvilablityCellView from "./AvilablityCellView";


type AvilabilityTableViewProp = {
  colLabel: string[]
  rowLabel: string[]
  data: boolean[][]
}

export default function AvilabilityTableView({colLabel, rowLabel, data}: AvilabilityTableViewProp) {
  const emptyCellsForSkeleton: boolean[][] = useMemo(() => {
    return getEmptyCellsForSkeleton<boolean>(colLabel.length, rowLabel.length-1, true)
  },[rowLabel, colLabel])

  const shiftDataElements = useMemo(() => {
    let uiArray = (data ?? emptyCellsForSkeleton).map((array) => array.map((avilability => {
      return (
        <AvilablityCellView avilablity={avilability}/>
      )
    })))
    return uiArray

  }, [data])

  const flexHeadArray = useMemo(()=>(Array(colLabel.length).fill(1)),[rowLabel])

  return (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={colLabel} flexArr={flexHeadArray} style={styles.head} textStyle={styles.text} />
        <TableWrapper style={styles.wrapper}>
          <Col data={rowLabel} style={styles.title} textStyle={styles.text} />
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
  constraint_allow: {backgroundColor: 'green'},
  constraint_dis_allow: {backgroundColor: 'red'}
});



