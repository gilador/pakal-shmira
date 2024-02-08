import {StyleSheet, View} from 'react-native';
import React from "react";
import {colors} from "../../../styles";

export interface SplitScreenCompProps{
  leftPanel: JSX.Element
  rightPanel: JSX.Element
}

export default function SplitScreenComp({ leftPanel, rightPanel}: SplitScreenCompProps): JSX.Element {
  const newRightPanel = React.cloneElement(rightPanel, {style: styles.rightPanel})
  const newLeftPanel = React.cloneElement(leftPanel, {style: styles.leftPanel})

  return (
    <View style={styles.container}>
      {newLeftPanel}
      <View style={styles.separator}/>
      {newRightPanel}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    flexBasis: 'auto'
  },
  leftPanel:{
    flexGrow: 300,
    flexShrink: 100,
    backgroundColor: 'pink',

  },
  separator: {
    backgroundColor: colors.black,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 1,
    marginVertical: 60
  },
  rightPanel:{
    flexGrow: 500,
    flexShrink: 500,
  },
});
