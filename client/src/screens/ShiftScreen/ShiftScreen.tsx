import { useRef } from "react";

import SplitScreenComp from "./elements/SplitScreenComp";
import useGenerateShiftTableView from "./hooks/useGenerateShiftTableView";
import useShiftResourceListView from "./hooks/useShiftResourceListView";

export interface ShiftScreenProps {
}

export default function ShiftScreen({ }: ShiftScreenProps) {
  const {tableView} = useGenerateShiftTableView()
  const {list, view: listView} = useShiftResourceListView()

  return (
    SplitScreenComp({ leftPanel: listView, rightPanel: tableView })
  );
}
