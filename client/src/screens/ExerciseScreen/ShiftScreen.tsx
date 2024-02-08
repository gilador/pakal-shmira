import { useRef } from "react";

import MathSet from "./elements/Set/MathSet";
import SplitScreenComp from "./elements/SplitScreenComp";
import useMathControlPanelHook from "./hooks/UseMathControlPanelHook";
import useGenerateShiftTableView from "./hooks/useGenerateShiftTableView";
import { View } from "../../components/Themed";
import useShiftResourceListView from "./hooks/useShiftResourceListView";

export interface ShiftScreenProps {
}

export default function ShiftScreen({ }: ShiftScreenProps) {
  const {tableView} = useGenerateShiftTableView()
  const {list} = useShiftResourceListView()

  return (
    SplitScreenComp({ leftPanel: list, rightPanel: tableView })
  );
}
