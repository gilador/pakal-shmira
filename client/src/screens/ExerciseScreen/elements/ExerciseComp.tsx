import {StyleSheet, View} from 'react-native';
import React from "react";
import {colors} from "../../../styles";

export interface EXScreenProps{
  leftPanel: JSX.Element
  rightPanel: JSX.Element
}

export default function ExerciseComp({ leftPanel, rightPanel}: EXScreenProps): JSX.Element {
  const newRightPanel = React.cloneElement(rightPanel, {style: styles.rightPanel})
  const newLeftPanel = React.cloneElement(leftPanel, {style: [leftPanel.props.style, styles.rightPanel]})

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
    backgroundColor: 'white'
  },
  leftPanel:{
    flexGrow: 500,
    flexShrink: 500,
    backgroundColor: 'white',

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
