import React, { createContext, useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import EditableList from "@app/screens/shiftScreen/elements/EditableList";
import { extractWords } from "@app/common/utils";
import { User } from "../models";

export type ShiftListContextType = {
  onUserToggleSelected: (userNameId: string | undefined) => void;
  onUserAdded: (userNameId: string | undefined) => void;
  onUserRemoved: (userNameId: string) => void;
  selectedNameId: string | undefined;
};

export const ShiftListContext = createContext<ShiftListContextType>({
  onUserToggleSelected: () => {},
  onUserAdded: () => {},
  onUserRemoved: () => {},
  selectedNameId: undefined,
});

export default function useShiftUsersListView() {
  const mocked = [
    { name: "אלון", id: "1" },
    { name: "צביקה", id: "2" },
    { name: "תמיר", id: "3" },
    { name: "רחמים", id: "4" },
    { name: "מתי", id: "5" },
    { name: "כספי", id: "6" },
    { name: "אליהו", id: "7" },
  ];
  const [list, setList] = useState<User[]>(mocked);

  const [selectedNameId, setSelectedNameId] = useState<string | undefined>(
    undefined,
  );

  const toggleUserSelection = useCallback(
    (userNameId: string | undefined) => {
      setSelectedNameId((selectedNameId) =>
        selectedNameId === userNameId ? undefined : userNameId,
      );
    },
    [list],
  );

  const onAdd = (user: string | undefined) => {
    if (!user){
      return
    }
    const names = extractWords(user);
    const ret = names.map((ele) => ({
      name: ele,
      id: `${ele}+${Date.now()}`,
    }));

    setList((preList) => {
      preList.push(...ret);
      return [...preList];
    });
  };

  const onRemove = (userId: string) => {
    setList((preList) => {
      const index = preList.findIndex((el) => el.id === userId);
      if (index >= 0) {
        index >= 0 && preList.splice(index, 1);
      }
      return [...preList];
    });
  };

  const context: ShiftListContextType = {
    onUserToggleSelected: toggleUserSelection,
    onUserAdded: onAdd,
    onUserRemoved: onRemove,
    selectedNameId: selectedNameId,
  };

  const ShiftResourceListView = (
    <ShiftListContext.Provider value={context}>
      <View style={styles.container}>
        <EditableList list={list} />
      </View>
    </ShiftListContext.Provider>
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
