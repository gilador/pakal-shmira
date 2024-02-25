import { useCallback, useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, TouchableWithoutFeedbackComponent, View } from 'react-native';
import { Table, Row, Rows, TableWrapper, Col } from 'react-native-reanimated-table';

import { ShiftBoard } from "../models";
import { UserConstraints } from "@app/services/optimizeService/models";
import { optimize } from "@app/services/optimizeService/OptimizieService";
import { stringify } from "qs";


interface useGenerateShiftTableViewProp{
  names: (string | undefined) [],
  selectedNameIndex: number
}

export default function useGenerateShiftTableView({names, selectedNameIndex} : useGenerateShiftTableViewProp) {

const [shiftData, setShiftData] = useState(getShiftBoardDataMock(names))

console.log(`useGenerateShiftTableView->shiftData:${JSON.stringify(shiftData)}`)

const handleOptimize = async ()=>{
  const userShifts = await optimize(shiftData.personals)
  setShiftData(prev => {
    prev.personals = userShifts
    const boardShift: string[][] = prev.shifts
    userShifts.forEach((userShift)=>{
      let total = 0
      userShift.assigemnts.forEach((hourArray, hourIndex)=>{
        hourArray.forEach((post, postIndex)=>{
          console.log(`handleOptimize-> ${userShift.name},[${hourIndex}][${postIndex}]= ${post}`)
          if(post === 1){
            boardShift[postIndex][hourIndex] = userShift.name
            total++
          }
        })
      })
      console.log(`Total shifts for ${userShift.name} is ${total}`)
    })
    prev.shifts = boardShift
  return {...prev}})
}

console.log('useGenerateShiftTableView')
  const getShiftView = (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={shiftData.posts} flexArr={[1, 1, 1, 1,1]} style={styles.head} textStyle={styles.text} />
        <TableWrapper style={styles.wrapper}>
          <Col data={shiftData.hours} style={styles.title} textStyle={styles.text} />
          <Rows data={shiftData.shifts} flexArr={[1, 1, 1,1]} style={styles.row} textStyle={styles.text} />
        </TableWrapper>
      </Table>
    </View>
  )

  return {
    tableView: getShiftView,
    shiftData,
    handleOptimize
  }
}

function getShiftBoardDataMock(names: (string | undefined) []): ShiftBoard {
  const posts = ['', 'ש.ג1', 'ש.ג2', 'מערבי', 'מזרחי']
  const hours = ['0600-1000', '1000-1400', '1400-1600', '1600-2000', '2000-2400']
  
  const sharedConst = ['ש.ג1', 'ש.ג2', 'מערבי', 'מזרחי'].reduce(
    (acumPosts, post )=> {
      const origRet: number[] = hours.reduce((acumeHours, hour)=>{
        (acumeHours as number[]).push(1)
        return acumeHours
      },[]);
      (acumPosts as number[][]).push(origRet)
      return acumPosts
    }
  ,[])

  const usersConst = names?.reduce((acum, name) => {
    let userCon:UserConstraints  = {
      name: name || '',
      assigemnts: sharedConst
    };
    (acum as UserConstraints[]).push(userCon)
    return acum
  }, [])

  console.log(`gilad-> getShiftBoardDataMock-> usersConst: ${JSON.stringify(usersConst)}`)

  const mockShiftBoard = {
    personals: usersConst,
    posts,
    hours,
    shifts: [['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', '']]
  }
  return mockShiftBoard
}

const styles = StyleSheet.create({
  container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 50, backgroundColor: '#f1f8ff', textAlign: 'center' },
  title: { flex: 1, backgroundColor: '#f6f8fa' },
  row: { height: 50 },
  text: { textAlign: 'center'},
  wrapper: { flexDirection: 'row' },

});
