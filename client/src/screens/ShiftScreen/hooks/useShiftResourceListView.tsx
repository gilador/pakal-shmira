import { EditableList } from "@app/components/EditableList";
import { optimize } from "@app/services/optimizeService/OptimizieService";
import { ReactComponentElement, useEffect, useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';
import { UserInfo } from "../models";

export default function useShiftResourceListView() {
  const mocked = ['חיים', 'אלון', 'יוסי', 'אפי', 'מאיר', 'עוז', 'צבי', 'תומר','מוטי','חזי','אלי'].map((val,index) => {
    let user: UserInfo = { name: val, id:`${val}+${index}`}
    return user
  })

  const [list, setList] = useState<UserInfo[]>(mocked);
  const [selectedNameId, setSelectedNameId] = useState<string>('יוסי+2');

  const shiftResourceListView = (
    <View style={styles.container}>
      <EditableList list={['חיים', 'אלון', 'יוסי', 'אפי', 'מאיר', 'עוז', 'צבי', 'תומר','מוטי','חזי','אלי']} optimizeCB={() => optimize([])} />
    </View>
  )

  return {
    list,
    selectedNameId,
    view: shiftResourceListView
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column',
    backgroundColor: 'white',
    flexBasis: 'auto'
  },
})