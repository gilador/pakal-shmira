import { StyleSheet, View, Text, Pressable } from "react-native"
import React, { memo } from "react"

import { IconButton } from "react-native-paper"

import withLogs from "@app/components/HOC/withLogs"

export type NameCellViewProps = {
  post: string | undefined
  cb?: () => void
}

const PostCellView = ({ post, cb }: NameCellViewProps) => {
  return (
    <Pressable onPress={cb} disabled={!cb} style={styles.postContainer}>
      {post && <IconButton icon={"close-circle"} onPress={cb} />}
    </Pressable>
  )
}

//------------------------------------------functions--------------------------------------------------------

//------------------------------------------StyleSheet--------------------------------------------------------

const styles = StyleSheet.create({
  postContainer: {
    alignContent: "center",
    alignItems: "center",
  },
  title: {
    backgroundColor: "blue",
    alignSelf: "flex-end",
  },
})

export default memo(withLogs(PostCellView))
