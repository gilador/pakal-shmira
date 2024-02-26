import { useCallback, useMemo, useState } from "react";
import React, { Component } from 'react';
import { StyleSheet, TouchableWithoutFeedbackComponent, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Table, Row, Rows, TableWrapper, Col } from 'react-native-reanimated-table';

import { optimize } from "@app/services/optimizeService/OptimizieService";
import { ShiftBoard, UserAssigments, UserInfo } from "../models";

interface useGenerateShiftTableViewProp {
  names: UserInfo[],
  selectedNameId: string
}

export default function useTableView({ names, selectedNameId}: useGenerateShiftTableViewProp) {
  console.log(`useTableView->names:${JSON.stringify(names)}`)
  const [shiftData, setShiftData] = useState(getShiftBoardDataMock(names))

  const shiftDataElements = useMemo(() => {

    const uiArray = shiftData.shifts.map((array) => array.map((val => { 
      console.log(`val:m${JSON.stringify(val)}, selectedNameId: ${selectedNameId}`)
      return(
      <TouchableOpacity onPress={() => alertIndex(val.id)}>
        <View style={styles.btn}>
          <Text style={val.id === selectedNameId ? {backgroundColor: 'blue'} : {backgroundColor: 'white'}}>{val.name}</Text>
        </View>
      </TouchableOpacity>
      )
    })))
    return uiArray

  }, [shiftData])

  const alertIndex = (value: any) => {
    console.log(`This is column ${value}`);
  }

  const handleOptimize = async () => {
    try {
      // Optimize user shifts asynchronously
      const userShifts = await optimize(shiftData.personals);

      // Update shift data
      setShiftData((prev: ShiftBoard) => {
        const boardShift = prev.shifts.slice(); // Create a copy of board shifts
        userShifts.forEach((userShift, index) => {
          let total = 0;
          userShift.assignments.forEach((hourArray, hourIndex) => {
            hourArray.forEach((post, postIndex) => {
              console.log(`handleOptimize-> ${userShift.user.name},[${hourIndex}][${postIndex}]= ${post}`);
              if (post === 1) {
                boardShift[postIndex][hourIndex] = {name: userShift.user.name, id: `${userShift.user.name}+${index}`}
                total++;
              }
            });
          });
          userShift.total = total
        });

        // Update shift data with the optimized shifts
        return { ...prev };
      });
    } catch (error) {
      console.error('Error occurred while optimizing shifts:', error);
      // Handle error appropriately, e.g., show error message to the user
    }
  };

  const getShiftView = (
    <View style={styles.container}>
      <Table borderStyle={{ borderWidth: 1 }}>
        <Row data={shiftData.posts} flexArr={[1, 1, 1, 1, 1]} style={styles.head} textStyle={styles.text} />
        <TableWrapper style={styles.wrapper}>
          <Col data={shiftData.hours} style={styles.title} textStyle={styles.text} />
          <Rows data={shiftDataElements} flexArr={[1, 1, 1, 1]} style={styles.row} textStyle={styles.text} />
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

function getShiftBoardDataMock(users: UserInfo[]): ShiftBoard {
  const posts = ['', 'ש.ג1', 'ש.ג2', 'מערבי', 'מזרחי']
  const hours = ['0600-1000', '1000-1400', '1400-1600', '1600-2000', '2000-2400']

  const sharedConstraints = ['ש.ג1', 'ש.ג2', 'מערבי', 'מזרחי'].reduce(
    (acumPosts, post) => {
      const origRet: number[] = hours.reduce((acumeHours, hour) => {
        (acumeHours as number[]).push(1)
        return acumeHours
      }, []);
      (acumPosts as number[][]).push(origRet)
      return acumPosts
    }
    , [])

  const usersConst = users?.reduce((acum, user, index) => {
    let userCon: UserAssigments = {
      user: {name: user.name || '', id:`${user.name}+${index}`},
      assignments: sharedConstraints,
      total: 0
    };
    (acum as UserAssigments[]).push(userCon)
    return acum
  }, [])

  // console.log(`gilad-> getShiftBoardDataMock-> usersConst: ${JSON.stringify(usersConst)}`)

  const mockShiftBoard = {
    personals: usersConst,
    posts,
    hours,
    shifts: [[{name:'',id:''}, {name:'',id:''}, {name:'',id:''}, {name:'',id:''}],
    [{name:'',id:''}, {name:'',id:''}, {name:'',id:''}, {name:'',id:''}],
    [{name:'',id:''}, {name:'',id:''}, {name:'',id:''}, {name:'',id:''}],
    [{name:'',id:''}, {name:'',id:''}, {name:'',id:''}, {name:'',id:''}],
    [{name:'',id:''}, {name:'',id:''}, {name:'',id:''}, {name:'',id:''}]]
  }
  return mockShiftBoard
}

const styles = StyleSheet.create({
  container: { flex: 10, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 50, backgroundColor: '#f1f8ff', textAlign: 'center' },
  title: { flex: 1, backgroundColor: '#f6f8fa' },
  row: { height: 50 },
  text: { textAlign: 'center' },
  wrapper: { flexDirection: 'row' },
  btn: { width: 58, height: 18, marginLeft: 15, backgroundColor: '#c8e1ff', borderRadius: 2 },


});



