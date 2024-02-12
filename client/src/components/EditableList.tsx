import { useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleProp, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';
import { Button } from "react-native-paper";
import ApiService from "../services/api/ApiService";

interface EditableListProps {
  list: string[],
}

export function EditableList(props: EditableListProps) {
  type ItemProps = { title: string };
  const Item = ({ title }: ItemProps) => (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  return <View style={styles.container}>
    <Button style={styles.comp} onPress={()=>ApiService.optimizeShift()}>optimize</Button>
    <FlatList
      style={styles.comp2}
      data={props.list}
      renderItem={({ item }) => <Item title={item} />} />
  </View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: '100%',
  },
  comp: {
    height:'50px',
    backgroundColor: '#3F445500'
  },
  comp2: {
    flexGrow: 70,
    backgroundColor: 'green'

  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});
