import { useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Table, Row, Rows, TableWrapper, Col } from 'react-native-reanimated-table';
import { ShiftBoard } from "../models";

export default function useGenerateShiftTableView(shiftBoardData: ShiftBoard) {
console.log('useGenerateShiftTableView')
  const getShiftView = (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={shiftBoardData.posts} flexArr={[1, 1, 1, 1,1]} style={styles.head} textStyle={styles.text} />
        <TableWrapper style={styles.wrapper}>
          <Col data={shiftBoardData.hours} style={styles.title} textStyle={styles.text} />
          <Rows data={shiftBoardData.shifts} flexArr={[1, 1, 1,1]} style={styles.row} textStyle={styles.text} />
        </TableWrapper>
      </Table>
    </View>
  )

  return {
    tableView: getShiftView
  }
}

const styles = StyleSheet.create({
  container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 50, backgroundColor: '#f1f8ff', textAlign: 'center' },
  title: { flex: 1, backgroundColor: '#f6f8fa' },
  row: { height: 50 },
  text: { textAlign: 'center'},
  wrapper: { flexDirection: 'row' },

});
