import React from "react";
import {StyleSheet, Text, TextStyle, View} from "react-native";

import CommonSet, {CommonSetProps} from "./CommonSet";

import {colors} from "../../../../styles";
import LetterExp from "../LettterExp";

export interface ABCSetScreenProps extends CommonSetProps{
    letters: string[]
    fontStyle: TextStyle
}

function ABCSet({letters, fontStyle}: ABCSetScreenProps) {

    return (
        <View style={styles.container}>
            { letters.map((value)=>{return <LetterExp letter={value} fontStyle={fontStyle}/>})}
        </View>
    )
}

export default CommonSet(ABCSet)

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderStyle: "dashed",
        borderRadius: 10,
        borderColor: colors.slate_grey,
        borderWidth: 5,
        marginHorizontal: 100,
        minHeight: 500
    },
});
