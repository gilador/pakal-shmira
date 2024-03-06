import NameCellView from "@app/screens/shiftScreen/elements/NameCellView";
import { User } from "@app/screens/shiftScreen/models";
import { colors } from "@app/styles";
import React, { memo, useEffect, useRef, useState, useTransition } from "react";
import { FlatList, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { IconButton, TextInput } from "react-native-paper";

type EditableListProps = {
  list: User[];
  onSelect: (selectedNameId: string | undefined) => void;
  selectedNameId: string | undefined;
  onUserAdded: (user: string) => void;
  onUserDeleted: (user: string) => void;
};

type ItemProps = {
  user: User;
  selectedNameId: string | undefined;
  onSelect: (selectedNameId: string) => void;
  onDelete: (selectedNameId: string) => void;
  isEditing: boolean;
};

const Item = memo(
  ({ user, selectedNameId, onSelect, onDelete, isEditing }: ItemProps) => {
    // const isSelected = isEditing ? false : selectedNameId === user.id
    return (
      <View>
        <NameCellView
          user={user}
          isSelected={selectedNameId === user.id}
          cb={() => {
            !isEditing && onSelect(user.id);
          }}
        />
        {isEditing && (
          <IconButton
            style={{
              position: "absolute",
              alignSelf: "flex-end",
              alignContent: "center",
            }}
            icon={"close-circle"}
            onPress={() => onDelete(user.id)}
          />
        )}
      </View>
    );
  },
);

type EditAddButtonProps = {
  onSelect: (selectedNameId: string | undefined) => void;
};

type EditAddButtonViewProps = {
  style?: StyleProp<ViewStyle>;
  selectedNameId: string | undefined;
  onSelect: (selectedNameId: string | undefined) => void;
};

const useEditAddButton = ({ onSelect }: EditAddButtonProps) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const EditAddButtonView = memo(
    ({ onSelect, selectedNameId, style }: EditAddButtonViewProps) => (
      <View style={style}>
        <IconButton
          icon={isEditing ? "checkbox-marked-circle" : "square-edit-outline"}
          onPress={() => {
            setIsEditing((pre) => !pre);
            onSelect(selectedNameId);
          }}
          containerColor="lightgreen"
        />
      </View>
    ),
  );

  return {
    isEditing,
    EditAddButtonView,
  };
};

const EditableList = memo((props: EditableListProps) => {
  const { isEditing, EditAddButtonView } = useEditAddButton({
    onSelect: props.onSelect,
  });
  const [textValue, setTextValue] = React.useState<string | undefined>(
    undefined,
  );
  const textInputRef = useRef<any>(null);

  useEffect(() => {
    !isEditing && handleUserAdd(textValue, props);
    setTextValue("");
  }, [isEditing]);

  return (
    <View style={styles.container}>
      <EditAddButtonView
        style={styles.button}
        onSelect={props.onSelect}
        selectedNameId={props.selectedNameId}
      />
      {isEditing && (
        <TextInput
          ref={textInputRef}
          mode="outlined"
          placeholderTextColor="lightgray"
          style={styles.input}
          value={textValue}
          placeholder="הזן שמות ברווחים"
          onChangeText={(val: string) => {
            console.log(`r-onChangeText-> is`);
            setTextValue(val);
          }}
          onBlur={() => {
            console.log(`r-onBlur-> is`);
            handleUserAdd(textValue, props);
            setTextValue("");
            textInputRef?.current?.focus();
          }}
        />
      )}
      <FlatList
        style={styles.list}
        data={props.list}
        renderItem={({ item }) => (
          <Item
            user={item}
            selectedNameId={props.selectedNameId}
            isEditing={isEditing}
            onSelect={props.onSelect}
            onDelete={props.onUserDeleted}
          />
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },

  list: {
    flexGrow: 70,
  },
  item: {
    padding: 10,
    marginVertical: 1,
    marginHorizontal: 5,
    backgroundColor: colors.light_grey1,
    alignItems: "center",
  },
  button: {
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 32,
  },
  input: {
    flexGrow: 0,
    flexShrink: 1,
    width: "100%",
  },
});

export default EditableList;

function handleUserAdd(
  textValue: string | undefined,
  props: EditableListProps,
) {
  if (textValue) {
    props.onUserAdded(textValue);
  }
}
