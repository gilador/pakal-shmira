import { extractWords } from "@app/common/utils";
import EditableList from "@app/screens/shiftScreen/elements/EditableList";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { User } from "../models";

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

  //TODO
  const toggleUserSelection = useCallback(
    (userNameId: string | undefined) => {
      setSelectedNameId((selectedNameId) =>
        selectedNameId === userNameId ? undefined : userNameId,
      );
    },
    [list],
  );

  const onAdd = (user: string) => {
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

  const onDelete = (userId: string) => {
    setList((preList) => {
      console.log(`onDelete->before->preList: ${JSON.stringify(preList)}`);
      const index = preList.findIndex((el) => el.id === userId);
      if (index >= 0) {
        index >= 0 && preList.splice(index, 1);
      }

      console.log(`onDelete->after->ret: ${JSON.stringify(preList)}`);

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
        onUserDeleted={onDelete}
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
