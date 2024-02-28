import { useCallback, useMemo, useState } from "react";
import React, { Component } from 'react';
import { FlatList, StyleProp, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Text,
} from 'react-native';
import { Button } from "react-native-paper";
import ApiService from "../services/api/ApiService";
import { colors } from "@app/styles";
import { UserInfo } from "@app/screens/shiftScreen/models";
import UserCell from "./userCell";

type EditableListProps = {
  list: UserInfo[]
  onSelect: (selectedNameId: string) => void
  selectedNameId: string
}

export function EditableList(props: EditableListProps) {
  type ItemProps = { user: UserInfo };
  const Item = ({ user }: ItemProps) => (
    <UserCell user={user} isSelected={props.selectedNameId === user.id} cb={() => props.onSelect(user.id)} />
  );

  return (<View style={styles.container}>
    <FlatList
      style={styles.comp2}
      data={props.list}
      renderItem={({ item }) => <Item user={item} />} />
  </View>)
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
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
  },
});
