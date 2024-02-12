import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, ListRenderItemInfo, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Text, View} from "../components/Themed";
import {baseOP} from "../screens/ShiftScreen/model/MathExercise";
import {Dictionary} from "../common/Dictionary";
import {IconButton} from "react-native-paper";
import Colors from "../constants/Colors";

export interface SelectedBoxesModel<T extends baseOP> {
  symbol: T
}


export interface TitledSelectedBoxesModel<T extends baseOP>{
  title: string
  ops: SelectedBoxesModel<T>[]
  multi?: boolean
  initialState: number
  style: StyleProp<ViewStyle>

}

export default function useTitledSelectedBoxesHook<T extends baseOP>({title, ops, style, multi = true, initialState = 0}: TitledSelectedBoxesModel<T>) {

  const initSelectedOpsCop: Dictionary<T> = useMemo(()=>{{
    let val: Dictionary<T> = {}
    val[ops[initialState].symbol.sign] = ops[initialState].symbol
    val[ops[initialState].symbol.sign].selected = true
    return val
  }},[])

  const [selectedOps, setSelectedOps] = useState<Dictionary<T>>(initSelectedOpsCop);

  useEffect(()=>{
    const firstOp = ops[0].symbol
    updateSelectedOps(firstOp)
  },[])

  const listViewRender = (item: ListRenderItemInfo<SelectedBoxesModel<T>>) => {
    return <IconButton
        icon={item.item.symbol.icon}
        containerColor={item.item.symbol.selected ?  Colors.selected : Colors.unselected}
        onPress={()=>updateSelectedOps(item.item.symbol)}
    />
  }

  const updateSelectedOps = (op: T) => {
    let selectedOpsCop = {...selectedOps}
    if(selectedOps[op.sign]){
      if(Object.keys(selectedOps).length == 1) {
        op.selected = true
        return
      }
      op.selected = false
      delete selectedOpsCop[op.sign]
    }
    else{
      op.selected = true
      if(!multi){
        for (let i = 0; i < Object.keys(selectedOps).length; i++) {
          const key = Object.keys(selectedOps)[i]
          selectedOps[key].selected = false
          delete selectedOpsCop[key]
        }
      }
      selectedOpsCop[op.sign] = op
      selectedOpsCop[op.sign].selected = true
    }
    setSelectedOps(selectedOpsCop)
  }

  const getTitledSelectedBoxesView = (
        <View style={[style, styles.container]}>
          <Text
              selectable={false}
              style={styles.signsTitle}
              lightColor="rgba(0,0,0,0.8)"
              darkColor="rgba(255,255,255,0.8)">
            {title}
          </Text>

          <FlatList
              contentContainerStyle={styles.cardsContainerStyle}
              style={styles.cardsStyle}
              data={ops}
              horizontal={true}
              keyExtractor={item => item.symbol.sign}
              renderItem={listViewRender}
          />
        </View>)

  return {
    selectedOps,
    getTitledSelectedBoxesView
  }


}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:'100%',

  },
  signsTitle: {
    fontSize: 17,
    lineHeight: 24,
    alignSelf: 'flex-start'},

  cardsContainerStyle: {
    alignSelf:"center"
  },
  cardsStyle: {

    height: '100%',
    alignSelf:"center"

  },
  itemStyle: {
    height: '100%',
    margin: 5
  },
});
