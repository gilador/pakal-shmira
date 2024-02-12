import { useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Table, Row, Rows, TableWrapper, Col } from 'react-native-reanimated-table';

export default function useGenerateShiftTableView() {
  const [postsList, setPostsList] = useState(['', 'ש.ג1', 'ש.ג2', 'מערבי', 'מזרחי']);
  const [shiftList, setShiftList] = useState(['0600-1000','1000-1400','1400-1600','1600-2000','2000-2400']);
  const [shiftData, setShiftData] = useState([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']])


  const getShiftView = (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={postsList} flexArr={[1, 1, 1, 1,1]} style={styles.head} textStyle={styles.text} />
        <TableWrapper style={styles.wrapper}>
          <Col data={shiftList} style={styles.title} textStyle={styles.text} />
          <Rows data={shiftData} flexArr={[1, 1, 1,1]} style={styles.row} textStyle={styles.text} />
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
