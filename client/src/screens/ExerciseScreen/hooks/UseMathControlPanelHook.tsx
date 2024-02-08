import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import useTitledSelectedBoxesHook, { SelectedBoxesModel } from "../../../hooks/UseTitledSelectedBoxesHook";
import { MathOP } from "../model/MathExercise";
import useSliderHook from "../../../hooks/useSliderHook";
import usePrint from "../../../hooks/usePrinter";
import { MutableRefObject } from "react";


export interface MathControlPanelProps {
    itemPerRow: number
    printRef: MutableRefObject<HTMLDivElement | null>;
    style?: StyleProp<ViewStyle>
}

export default function useMathControlPanelHook({ itemPerRow, printRef, style }: MathControlPanelProps) {
    const ops: SelectedBoxesModel<MathOP>[] = [{ symbol: MathOP.PLUS }, { symbol: MathOP.MIN }, { symbol: MathOP.MULT }]
    const { getTitledSelectedBoxesView, selectedOps } = useTitledSelectedBoxesHook({ title: 'Choose signs', ops, style: styles.op })
    const { getSliderView: getAmountSliderView, rangeValue: amountValue } = useSliderHook({ title: 'Choose Amount', range: { min: 1, max: 5 }, initialVal: [2], step: 1, style: styles.slider })
    const { getSliderView: getDifficultySliderView, rangeValue: difficultyValue } = useSliderHook({ title: 'Choose Difficulty', range: { min: 1, max: 4 }, initialVal: [2], step: 1, style: styles.slider })
    const printer = usePrint(printRef)

    const getMathControlPanelView = (
        <View style={[style, styles.container]}>
            <View style={styles.ops}>
                {getTitledSelectedBoxesView}
                {getAmountSliderView}
                {getDifficultySliderView}
                {printer.printIcon}
                <View style={styles.buffer} />
            </View>
        </View>
    )

    return {
        getMathControlPanelView,
        selectedOps,
        amount: amountValue[0] * itemPerRow,
        difficulty: difficultyValue
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
    },
    ops: {
        flex: 1,
        flexDirection: 'column',
        marginStart: 100,
        alignItems: 'flex-start',
    },
    op: {
        flexGrow: 13,
        flexShrink: 13,
        paddingTop: 20

    },
    slider: {
        flexGrow: 13,
        flexShrink: 10,
        paddingTop: 20
    },
    buffer: {
        flexGrow: 57,
        flexShrink: 57,
    },
    print: {
        paddingTop: 40,
        alignSelf: "center"
    },
});
