import { Button } from "react-native-paper";
import { StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";


import SplitScreenComp from "./elements/SplitScreenComp";
import useShiftResourceListView from "./hooks/useShiftResourceListView";
import useTableView from "./hooks/useTableView";
import { ShiftBoard } from "./models";


export interface ShiftScreenProps {
}

export default function shiftScreen({ }: ShiftScreenProps) {
  console.log(`ShiftScreen rnder`)
  const { list: names, selectedNameId, view: namesListView } = useShiftResourceListView()
  const { tableView, shiftData, handleOptimize } = useTableView({ names, selectedNameId })

  return (
    <View style={styles.container}>
      {SplitScreenComp({ leftPanel: namesListView, rightPanel: tableView, style: styles.top })}
      <Button style={styles.bottom} onPress={() => { handleOptimize() }}>optimize</Button>
    </View>
  );
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

