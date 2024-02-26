import { Button } from "react-native-paper";
import { StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";


import SplitScreenComp from "./elements/SplitScreenComp";
import useShiftResourceListView from "./hooks/useShiftResourceListView";
import useTableView from "./elements/tableView";
import { ShiftBoard, UserAssigments, UserInfo } from "./models";
import { optimize } from "@app/services/optimizeService/OptimizieService";
import TableView from "./elements/tableView";


export interface ShiftScreenProps {
}

export default function shiftScreen({ }: ShiftScreenProps) {
  const { list: names, selectedNameId, view: namesListView } = useShiftResourceListView()
  const [shiftData, setShiftData] = useState(getShiftBoardDataMock(names))

  const handleOptimize = useCallback(async () => {
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
                boardShift[postIndex][hourIndex] = { name: userShift.user.name, id: `${userShift.user.name}+${index}` }
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
  },[names])

  return (
    <View style={styles.container}>
      {SplitScreenComp({ leftPanel: namesListView, rightPanel: (<TableView selectedNameId={selectedNameId} shiftData={shiftData} />), style: styles.top })}
      <Button style={styles.bottom} onPress={handleOptimize}>optimize</Button>
    </View>
  );
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
      user: { name: user.name || '', id: `${user.name}+${index}` },
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
    shifts: [[{ name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }],
    [{ name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }],
    [{ name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }],
    [{ name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }],
    [{ name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }, { name: '', id: '' }]]
  }
  return mockShiftBoard
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flexShrink: 1,
    flexGrow: 1,
    backgroundColor: 'white',
    padding: 2,
  },
  top: {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: 'lightblue',
    margin: 5,
  },
  bottom: {
    flexGrow: 0,
    flexShrink: 1,
    marginBottom: 30,
    width: 300,
    alignSelf: 'flex-start',
    backgroundColor: 'lightgreen',
  },
});

