import { useEffect, useMemo, useRef, useState } from "react";

import SplitScreenComp from "./elements/SplitScreenComp";
import useGenerateShiftTableView from "./hooks/useGenerateShiftTableView";
import useShiftResourceListView from "./hooks/useShiftResourceListView";
import { ShiftBoard } from "./models";

export interface ShiftScreenProps {
}

export default function ShiftScreen({ }: ShiftScreenProps) {
  console.log(`ShiftScreen rnder`)
  const { list: namesData, selectedName, view: namesListView } = useShiftResourceListView()
  const cachedValue: ShiftBoard = useMemo(() => getShiftBoardData(namesData), [namesData])

  const { tableView } = useGenerateShiftTableView(cachedValue)


  return (
    SplitScreenComp({ leftPanel: namesListView, rightPanel: tableView })
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

