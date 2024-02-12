import { ReactComponentElement, useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';
import { EditableList } from "../../../components/EditableList";

export default function useShiftResourceListView(){
  const [list, setList] = useState(['חיים','אלון','יוסי','אפי','מאיר','עוז','צבי','תומר',]);


  return {
    list,
    view: <EditableList list={list}/>}
}