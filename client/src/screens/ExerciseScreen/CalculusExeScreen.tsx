import {useRef} from "react";

import MathSet from "./elements/Set/MathSet";
import ExerciseComp from "./elements/ExerciseComp";
import useMathControlPanelHook from "./hooks/UseMathControlPanelHook";
import useGenerateCalculusExercises from "./hooks/useGenerateCalculusExercises";
import useAnswerButton from "./hooks/useAnswerButton";
import { View } from "../../components/Themed";

export interface EXScreenProps{
}

export default function CalculusExeScreen({  }: EXScreenProps) {
  const itemPerRow = 4
  const printRef = useRef<HTMLDivElement>(null);
  const { getMathControlPanelView, selectedOps, amount, difficulty} = useMathControlPanelHook({itemPerRow: itemPerRow, printRef})
  const generatedExs = useGenerateCalculusExercises(difficulty, amount, selectedOps)
  const {getAnswerButton, showAnswers} = useAnswerButton()

  return (
      ExerciseComp({leftPanel: getMathControlPanelView, rightPanel:(<View/>)})
  );
}
