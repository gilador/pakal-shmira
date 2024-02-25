import {StyleSheet, View, StyleProp, ViewStyle} from 'react-native';
import React from "react";
import {colors} from "../../../styles";

export interface SplitScreenCompProps{
  leftPanel: JSX.Element
  rightPanel: JSX.Element
  style?: StyleProp<ViewStyle>
}

export default function SplitScreenComp({ leftPanel, rightPanel, style}: SplitScreenCompProps): JSX.Element {
  const newRightPanel = React.cloneElement(rightPanel, {style: styles.rightPanel})
  const newLeftPanel = React.cloneElement(leftPanel, {style: styles.leftPanel})
  return (
    <View style={[style, styles.container]}>
      {newLeftPanel}
      <View style={styles.separator}/>
      {newRightPanel}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'pink  ',
  },
  leftPanel:{
    flexShrink: 1,
    flexGrow:1,
  },
  separator: {
    backgroundColor: colors.black,
    flexBasis: 1,
    marginVertical: 60,
    marginHorizontal: 20,
  },
  rightPanel:{
    flexGrow:50,
    flexShrink: 1
  },
});
