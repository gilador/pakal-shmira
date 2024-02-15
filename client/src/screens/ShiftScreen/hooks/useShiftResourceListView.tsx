import { ReactComponentElement, useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';
import { EditableList } from "../../../components/EditableList";
import { optimize } from "../../../services/optimizeService/OptimizieService";

export default function useShiftResourceListView(){
  const [list, setList] = useState(['חיים','אלון','יוסי','אפי','מאיר','עוז','צבי','תומר',]);

  const mocked = [{}]
  return {
    list,
    view: <EditableList list={list} optimizeCB={()=>optimize([])}/>}
}