import { optimize } from "@app/services/optimizeService/OptimizeService";
import {
  ReactComponentElement,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import React, { Component } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native";
import { User } from "../models";
import EditableList from "@app/screens/shiftScreen/elements/EditableList";
import withLogs from "@app/components/HOC/withLogs";
import { extractWords } from "@app/common/utils";

export default function useShiftUsersListView() {
  const [list, setList] = useState<User[]>([]);

  const [selectedNameId, setSelectedNameId] = useState<string | undefined>(
    undefined,
  ); //TODO
  const toggleUserSelection = useCallback(
    (userNameId: string) => {
      setSelectedNameId((selectedNameId) =>
        selectedNameId === userNameId ? undefined : userNameId,
      );
    },
    [list],
  );

  const onAdd = (user: string) => {
    const names = extractWords(user)
    console.log(`names: ${JSON.stringify(names)}`)
    const ret = names.map((ele)=>({
      name: ele,
      id: `${ele}+${Date.now()}`,
    }))

    // const userObj = {
    //   name: user,
    //   id: `${user}+${Date.now()}`,
    // };
    setList((preList) => {
      preList.push(...ret);
      return [...preList];
    });
  };

  const ShiftResourceListView = (
    <View style={styles.container}>
      <EditableList
        list={list}
        onSelect={toggleUserSelection}
        selectedNameId={selectedNameId}
        onUserAdded={onAdd}
      />
    </View>
  );

  return {
    list,
    selectedNameId,
    view: ShiftResourceListView,
  };
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flexDirection: "column",
    backgroundColor: "white",
    flexBasis: "auto",
  },
});
