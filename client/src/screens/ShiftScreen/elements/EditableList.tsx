import React, {
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"
import { FlatList, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { IconButton, TextInput } from "react-native-paper"

import NameCellView from "@app/screens/shiftScreen/elements/NameCellView"
import { ShiftListContext } from "../hooks/useShiftUsersListView"
import useEditAddButton from "../hooks/useEditAddButton"
import { User } from "@app/screens/shiftScreen/models"
import { colors } from "@app/styles"

type EditableListProps = {
  list: User[]
}

type ItemProps = {
  user: User
  selectedNameId: string | undefined
  onSelect: (selectedNameId: string) => void
  onDelete: (selectedNameId: string) => void
  isEditing: boolean
}

const Item = memo(
  ({ user, selectedNameId, onSelect, onDelete, isEditing }: ItemProps) => {
    // const isSelected = isEditing ? false : selectedNameId === user.id
    return (
      <View>
        <NameCellView
          user={user}
          isSelected={selectedNameId === user.id}
          cb={() => {
            !isEditing && onSelect(user.id)
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
    )
  },
)

//-----
const EditableList = memo((props: EditableListProps) => {
  const shiftListContext = useContext(ShiftListContext)

  const { isEditing, EditAddButtonView } = useEditAddButton({})
  const [textValue, setTextValue] = React.useState<string | undefined>(
    undefined,
  )
  const textInputRef = useRef<any>(null)

  useEffect(() => {
    !isEditing && shiftListContext.onUserAdded(textValue)
    setTextValue("")
  }, [isEditing])

  return (
    <View style={styles.container}>
      <EditAddButtonView style={styles.button} />
      {isEditing && (
        <TextInput
          ref={textInputRef}
          mode="outlined"
          placeholderTextColor="lightgray"
          style={styles.input}
          value={textValue}
          placeholder="הזן שמות ברווחים"
          onChangeText={(val: string) => {
            console.log(`r-onChangeText-> is`)
            setTextValue(val)
          }}
          onBlur={() => {
            console.log(`r-onBlur-> is`)
            shiftListContext.onUserAdded(textValue)
            setTextValue("")
            textInputRef?.current?.focus()
          }}
        />
      )}
      <FlatList
        style={styles.list}
        data={props.list}
        renderItem={({ item }) => (
          <Item
            user={item}
            selectedNameId={shiftListContext.selectedNameId}
            isEditing={isEditing}
            onSelect={shiftListContext.onUserToggleSelected}
            onDelete={shiftListContext.onUserRemoved}
          />
        )}
      />
    </View>
  )
})

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
})

export default EditableList
