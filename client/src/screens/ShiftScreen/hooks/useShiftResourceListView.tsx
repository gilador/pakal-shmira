import { ReactComponentElement, useEffect, useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';
import { EditableList } from "../../../components/EditableList";
import { optimize } from "../../../services/optimizeService/OptimizieService";

export default function useShiftResourceListView(){
  const [list, setList] = useState(['חיים','אלון','יוסי','אפי','מאיר','עוז','צבי','תומר',]);
  const [selectedName, setSelectedName] = useState(['חיים']);

  const shiftResourceListView = (
    <View style={styles.container}>
      <EditableList list={list} optimizeCB={()=>optimize([])}/>
    </View>
  )

  const mocked = [{}]
  return {
    list,
    selectedName,
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