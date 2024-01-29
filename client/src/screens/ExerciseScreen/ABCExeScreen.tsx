import {useRef} from "react";

import ABCSet from "./elements/Set/ABCSet";
import ExerciseComp from "./elements/ExerciseComp";
import useLangControlPanelHook from "./hooks/UseLangControlPanelHook";

export interface EXScreenProps{
}

export default function ABCExeScreen({  }: EXScreenProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { getLangControlPanelView, letters, font} = useLangControlPanelHook({printRef})


console.log(`gilad->LangExeScreen-> letters: ${JSON.stringify(letters)}, font: ${JSON.stringify(font)}`)

  return (
      ExerciseComp({leftPanel: getLangControlPanelView, rightPanel:(<ABCSet letters={letters} fontStyle={font} printRef={printRef}/>)})
  );
}
