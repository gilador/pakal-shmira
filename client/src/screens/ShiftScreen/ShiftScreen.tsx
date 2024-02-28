import { Button } from "react-native-paper";
import { StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";


import SplitScreenComp from "./elements/SplitScreenComp";
import useShiftUsersListView from "./hooks/useShiftUsersListView";
import useTableView from "./elements/ShiftTableView";
import { ShiftBoard, UserAssigments, UserInfo } from "./models";
import { optimize } from "@app/services/optimizeService/OptimizieService";
import { getEmptyCellsForSkeleton } from "./utils";
import ShiftTableView from "./elements/ShiftTableView";
import AvilabilityTableView from "./elements/AvilabilityTableView";


export default function ShiftScreen() {
  console.log('ShiftScreen')
  const { list: names, selectedNameId, view: namesListView } = useShiftUsersListView()
  const [shiftData, setShiftData] = useState(getShiftBoardDataMock(names))
  const emptyCellsForSkeleton: UserInfo[][] = useMemo(() => {
    return getEmptyCellsForSkeleton<UserInfo>(shiftData.hours.length, shiftData.posts.length-1,{name:'',id:''})
  },[shiftData])

  const handleOptimize = useCallback(async () => {
    try {
      // Optimize user shifts asynchronously
      const userAssigments : UserAssigments[] = await optimize(shiftData.personals);

      // Update shift data
      setShiftData((prev: ShiftBoard) => {
        const shifts = emptyCellsForSkeleton.slice()
        userAssigments.forEach((userShift, index) => {
          let total = 0;
          userShift.assignments.forEach((hourArray, hourIndex) => {
            hourArray.forEach((post, postIndex) => {
              // console.log(`handleOptimize-> ${userShift.user.name},[${hourIndex}][${postIndex}]= ${post}`);
              if (post) {
                shifts[postIndex][hourIndex] = { name: userShift.user.name, id: `${userShift.user.name}+${index}` }
                total++;
              }
            });
          });
          userShift.total = total
        });
        const newShiftBoard: ShiftBoard = {personals: userAssigments, shifts, hours: prev.hours, posts: prev.posts}

        // console.log(`newShiftBoar: ${JSON.stringify(newShiftBoard)}`)
        return newShiftBoard;
      });
    } catch (error) {
      console.error('Error occurred while optimizing shifts:', error);
      // Handle error appropriately, e.g., show error message to the user
    }
  }, [shiftData])

  const rightView = useMemo(() => (
    <View>
      <ShiftTableView selectedNameId={selectedNameId} shifts={shiftData.shifts} hours={shiftData.hours} posts={shiftData.posts} />
      {selectedNameId && <AvilabilityTableView colLabel={shiftData.posts} rowLabel={shiftData.hours} data={shiftData.personals[0].assignments} />}
    </View>
  ), [selectedNameId, shiftData])

  return (
    <View style={styles.container}>
      {SplitScreenComp({ leftPanel: namesListView, rightPanel: rightView, style: styles.top })}
      <Button style={styles.bottom} onPress={handleOptimize}>optimize</Button>
    </View>
  );
}


//------------------------------------------functions--------------------------------------------------------

function getShiftBoardDataMock(users: UserInfo[]): ShiftBoard {
  const posts = ['', 'ש.ג1', 'ש.ג2', 'מערבי', 'מזרחי','דרומי']
  const hours = ['0600-1000', '1000-1400', '1400-1600', '1600-2000', '2000-2400', '0000-0400']

  const sharedConstraints = (posts.slice(1)).reduce(
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
    shifts: undefined
  }
  return mockShiftBoard
}

//------------------------------------------StyleSheet--------------------------------------------------------

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
  rightContainer: {
    flexDirection: 'column'
  }
});
