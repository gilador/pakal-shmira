import { useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleProp, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';
import { Button } from "react-native-paper";
import ApiService from "../services/api/ApiService";
import { colors } from "@app/styles";

interface EditableListProps {
  list: (string | undefined)[],
  optimizeCB: ()=>void
}

export function EditableList(props: EditableListProps) {
  type ItemProps = { title: string | undefined };
  const Item = ({ title }: ItemProps) => (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  return <View style={styles.container}>
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

  comp2: {
    flexGrow: 70,
  },
  item: {
    padding: 10,
    marginVertical: 1,
    marginHorizontal: 5,
    backgroundColor: colors.light_grey1,
    alignItems:'center'
  },
  title: {
    fontSize: 32,
  },
});
