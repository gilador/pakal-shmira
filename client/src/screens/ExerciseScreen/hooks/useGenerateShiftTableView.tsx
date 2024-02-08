import { useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Table, Row, Rows } from 'react-native-reanimated-table';

export default function useGenerateShiftTableView() {
    const [shiftList, setShiftList] = useState(['Head', 'Head2', 'Head3', 'Head4']);
    const [shiftData, setShiftData] = useState([
        ['1', '2', '3', '4'],
        ['a', 'b', 'c', 'd'],
        ['1', '2', '3', '456\n789'],
        ['a', 'b', 'c', 'd']])
    

    const getShiftView = (
        <View style={styles.container}>
        <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
          <Row data={shiftList} style={styles.head} textStyle={styles.text}/>
          <Rows data={shiftData} textStyle={styles.text}/>

        </Table>
      </View>
    )

    return{
        tableView: getShiftView
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 6 }
  });
