import {StyleSheet, Text, TextStyle, View} from 'react-native';
import {typography} from "../../../styles";
import React from "react";
import {black} from "react-native-paper/lib/typescript/styles/themes/v2/colors";
import {blue} from "react-native-reanimated/lib/types";


export interface VerticalProps {
    letter: string
    fontStyle: TextStyle
}

export default function LetterExp({letter, fontStyle}: VerticalProps) {
    return (
        <View style={styles.container}>
            <View style={styles.separator}/>
            <View style={styles.letterBox}>
                <Text style={[fontStyle]}>{letter}</Text>
                <Text style={[fontStyle]}>{letter}</Text>
                <Text style={[fontStyle]}>{letter}</Text>
                <Text style={[fontStyle]}>{letter}</Text>
            </View>
            <View style={styles.separator}/>
            <Text style={typography.h1.GreenRegular}>{' '}</Text>
            <View style={styles.separator}/>
            <Text style={typography.h1.GreenRegular}>{' '}</Text>
            <View style={styles.separator}/>
            <Text style={typography.h1.GreenRegular}>{' '}</Text>
            <View style={styles.separator}/>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        flexDirection: 'column',
        flexShrink: 100,
    },
    letterBox: {
        flexDirection: 'row',
        alignSelf: "flex-end",
    },
    separator: {
        backgroundColor: 'black',
        height: '1px',
    },
});
