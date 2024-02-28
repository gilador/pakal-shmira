import { optimize } from "@app/services/optimizeService/OptimizieService";
import { ReactComponentElement, memo, useCallback, useEffect, useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';
import { UserInfo } from "../models";
import { EditableList } from "@app/components/EditableList";

export default function useShiftUsersListView() {
  const mocked = ['חיים', 'אלון', 'יוסי', 'אפי', 'מאיר', 'עוז', 'צבי', 'תומר','מוטי','חזי','אלי'].map((val,index) => {
    let user: UserInfo = { name: val, id:`${val}+${index}`}
    return user
  })

  const [list, setList] = useState<UserInfo[]>(mocked);
  const [selectedNameId, setSelectedNameId] = useState<string>(''); //TODO
  const toggleUserSellection = useCallback((userNameId: string) => {
    setSelectedNameId(selectedNameId => selectedNameId === userNameId ? '' : userNameId)
  },[list])

  const shiftResourceListView = (
    <View style={styles.container}>
      <EditableList list={list} onSelect={toggleUserSellection} selectedNameId={selectedNameId}/>
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