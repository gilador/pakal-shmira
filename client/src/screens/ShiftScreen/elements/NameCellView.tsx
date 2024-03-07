import { StyleSheet, View, Text, Pressable } from "react-native"
import React, { memo } from "react"

import { User } from "@app/screens/shiftScreen/models"
import withLogs from "@app/components/HOC/withLogs"

export type NameCellViewProps = {
  user: User
  isSelected: boolean
  cb?: () => void
}

const NameCellView = (props: NameCellViewProps) => {
  return (
    <Pressable
      onPress={props.cb}
      disabled={!props.cb}
      onHoverIn={({ nativeEvent: MouseEvent }) => {}}
    >
      <Text style={getTextStyle(props.user, props.isSelected)}>
        {props.user.name}
      </Text>
    </Pressable>
  )
}

//------------------------------------------functions--------------------------------------------------------

function getTextStyle(user: User, isSelected: boolean): any[] {
  return [styles.title, isSelected ? styles.selected : {}]
}

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
  title: {
    paddingTop: 30,
    textAlign: "center",
    textAlignVertical: "top",
  },
  selected: { backgroundColor: "pink" },
})

export default memo(withLogs(NameCellView))
