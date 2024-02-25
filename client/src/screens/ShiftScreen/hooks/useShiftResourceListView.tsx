import { EditableList } from "@app/components/EditableList";
import { optimize } from "@app/services/optimizeService/OptimizieService";
import { ReactComponentElement, useEffect, useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';

export default function useShiftResourceListView() {
  const [list, setList] = useState(['חיים', 'אלון', 'יוסי', 'אפי', 'מאיר', 'עוז', 'צבי', 'תומר','מוטי','חזי','אלי',]);
  const [selectedNameIndex, setSelectedNameIndex] = useState(0);

  const shiftResourceListView = (
    <View style={styles.container}>
      <EditableList list={list} optimizeCB={() => optimize([])} />
    </View>
  )

  const mocked = [{}]
  return {
    list,
    selectedNameIndex,
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