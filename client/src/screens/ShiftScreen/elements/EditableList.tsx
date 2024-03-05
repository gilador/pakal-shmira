import NameCellView from "@app/screens/shiftScreen/elements/NameCellView"
import { User } from "@app/screens/shiftScreen/models"
import { colors } from "@app/styles"
import React, { memo, useEffect, useState } from "react"
import { FlatList, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { IconButton, TextInput } from "react-native-paper"

type EditableListProps = {
  list: User[]
  onSelect: (selectedNameId: string) => void
  selectedNameId: string | undefined
  onUserAdded: (user: string) => void
}

type ItemProps = {
  user: User
  selectedNameId: string | undefined
  onSelect: (selectedNameId: string) => void
  onDelete: (selectedNameId: string) => void
  isEditing: boolean
}

const Item = memo(
  ({ user, selectedNameId, onSelect, isEditing }: ItemProps) => (
    <View>
      <NameCellView
        user={user}
        isSelected={selectedNameId === user.id}
        cb={() => onSelect(user.id)}
      />
      {isEditing && (
        <IconButton
          style={{
            position: "absolute",
            alignSelf: "flex-end",
            alignContent: "center",
          }}
          icon={"close-circle"}
          onPress={() => {}}
        />
      )}
    </View>
  )
)

type EditAddButtonProps = {}
type EditAddButtonViewProps = {
  style?: StyleProp<ViewStyle>
}

const useEditAddButton = ({}: EditAddButtonProps) => {
  const [isEditing, setIsEditing] = React.useState(false)

  const EditAddButtonView = memo(({ style }: EditAddButtonViewProps) => (
    <View style={style}>
      <IconButton
        icon={isEditing ? "checkbox-marked-circle" : "square-edit-outline"}
        onPress={() => {
          setIsEditing((pre) => !pre)
        }}
        containerColor="lightgreen"
      />
    </View>
  ))

  return {
    isEditing,
    EditAddButtonView,
  }
}

const EditableList = memo((props: EditableListProps) => {
  const { isEditing, EditAddButtonView } = useEditAddButton({})
  const refAddedName = React.useRef<string | undefined>("")
  useEffect(() => {
    if (!isEditing && refAddedName.current) {
      props.onUserAdded(refAddedName.current)
    }
    refAddedName.current = undefined
  }, [isEditing])

  return (
    <View style={styles.container}>
      <EditAddButtonView style={styles.button} />
      {isEditing && (
        <TextInput
          style={styles.input}
          placeholder="שם"
          onChangeText={(val: string) => {
            refAddedName.current = val
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
            onSelect={props.onSelect}
            isEditing={isEditing}
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
