import { useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  Text,
} from 'react-native';

export default function useShiftResourceListView() {
  const [list, setList] = useState(['Danny', 'Israel', 'Moty']);

  type ItemProps = {title: string};


  const Item = ({title}: ItemProps) => (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  const getListView = (
    <View style={styles.container}>
      <FlatList
        data={list}
        renderItem={({item}) => <Item title={item} />}
      />
    </View>
  )

  return {
    list: getListView
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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