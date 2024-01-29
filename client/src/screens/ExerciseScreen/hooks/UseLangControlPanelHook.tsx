import {StyleProp, StyleSheet, View, ViewStyle} from "react-native";
import useTitledSelectedBoxesHook, {SelectedBoxesModel} from "../../../hooks/UseTitledSelectedBoxesHook";
import usePrint from "../../../hooks/usePrinter";
import {MutableRefObject, useEffect, useState} from "react";
import DropDownPicker from 'react-native-dropdown-picker';
import {createObjectList} from "../../../common/Common";
import {LangOP} from "../model/LangExercise";


export interface MathControlPanelProps{
    printRef: MutableRefObject<HTMLDivElement|null>;
    style?: StyleProp<ViewStyle>
}

export default function useLangControlPanelHook({printRef, style }: MathControlPanelProps) {
    const ops: SelectedBoxesModel<LangOP>[] = [{symbol: LangOP.Heb}, {symbol: LangOP.EN}]
    const [open, setOpen] = useState(false);
    const {getTitledSelectedBoxesView, selectedOps} = useTitledSelectedBoxesHook<LangOP>({
        initialState: 0,
        title:'Choose Language', ops, multi: false, style: styles.op})
    const [letters, setLetters] = useState([]);
    const firstKey = Object.keys(selectedOps)[0]
    const [items, setItems] = useState(createObjectList(selectedOps[firstKey].alphabet));

    useEffect(()=>{
        setItems(createObjectList(selectedOps[firstKey].alphabet))
        setLetters([])
    },[selectedOps])

    const printer = usePrint(printRef)

    const getLangControlPanelView = (
        <View style={[style, styles.container]}>
            <View style={styles.ops}>
                {getTitledSelectedBoxesView}
                <DropDownPicker
                    open={open}
                    value={letters}
                    items={items}
                    setOpen={setOpen}
                    setValue={setLetters}
                    setItems={setItems}
                    disableBorderRadius={true}
                    style={{borderWidth:0}}
                    multiple={true}
                    listMode="FLATLIST"

                    mode="BADGE"
                    showBadgeDot={false}
                />
                {printer.printIcon}
                <View style={styles.buffer}/>
            </View>
            <View style={styles.ops_buffer}>
            </View>
        </View>
    )

    return{
        getLangControlPanelView,
        letters,
        font: selectedOps[firstKey].font
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
        flexDirection: 'row',

    },
    ops: {
        flex: 1,
        flexDirection: 'column',
        marginStart:100,
        alignItems: 'flex-start',
        flexGrow: 30,

    },
    ops_buffer:{
        flexGrow: 70,
    },
    op: {
        flexGrow: 10,
        flexShrink: 10,
        paddingTop: 20,


    },
    slider: {
        flexGrow: 10,
        flexShrink: 10,
        paddingTop: 20
    },
    buffer:{
        flexGrow: 60,
        flexShrink: 60,
    },
    print: {
        paddingTop: 40,
        alignSelf: "center"
    },
});
