import { useEffect, useMemo, useRef, useState } from "react";

import SplitScreenComp from "./elements/SplitScreenComp";
import useGenerateShiftTableView from "./hooks/useGenerateShiftTableView";
import useShiftResourceListView from "./hooks/useShiftResourceListView";
import { ShiftBoard } from "./models";
import { Button } from "react-native-paper";
import { StyleSheet, View } from 'react-native';


export interface ShiftScreenProps {
}

export default function ShiftScreen({ }: ShiftScreenProps) {
  console.log(`ShiftScreen rnder`)
  const { list: namesData, selectedName, view: namesListView } = useShiftResourceListView()
  const cachedValue: ShiftBoard = useMemo(() => getShiftBoardData(namesData), [namesData])

  const { tableView } = useGenerateShiftTableView(cachedValue)


  return (
    <View style={styles.container}>
      {SplitScreenComp({ leftPanel: namesListView, rightPanel: tableView, style: styles.element })}
      <Button style={styles.comp} onPress={()=>{}}>optimize</Button>
    </View>
  );
}

function getShiftBoardData(names: string[]): ShiftBoard {
  const mockShiftBoard = {
    personals: names,
    posts: ['', 'ש.ג1', 'ש.ג2', 'מערבי', 'מזרחי'],
    hours: ['0600-1000', '1000-1400', '1400-1600', '1600-2000', '2000-2400'],
    shifts: [['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', '']]
  }
  return mockShiftBoard
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    padding: 20

  },
  element:{
    flexGrow: 30,
    backgroundColor: 'lightblue',
    margin: 5,
    },
  comp: {
    flexGrow: 1,
    marginBottom: 30,
    width: 300,
    alignSelf:'flex-start',
    backgroundColor: 'lightgreen',
  },
});

