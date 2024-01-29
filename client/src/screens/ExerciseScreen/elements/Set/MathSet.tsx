import {FlatGrid} from "react-native-super-grid";
import {StyleSheet} from "react-native";
import React from "react";

import CommonSet, {CommonSetProps} from "./CommonSet";
import {mathExercise} from "../../model/MathExercise";
import VerticalExp from "../VerticalExp";
import {colors} from "../../../../styles";

export interface MathSetScreenProps extends CommonSetProps{
    exArr: mathExercise[]
    showAnswers: boolean
}

function MathSet({exArr, showAnswers}: MathSetScreenProps) {

    return (
            <FlatGrid
            style={styles.gridView}
            itemDimension={50}
            fixed={true}
            maxItemsPerRow={4}
            scrollEnabled={false}
            data={exArr}
            renderItem={({item}) => (<VerticalExp exercise={item} showAnswers={showAnswers}/>)}/>
    )
}

export default CommonSet(MathSet)

const styles = StyleSheet.create({
    gridView: {
        borderStyle: "dashed",
        borderRadius: 10,
        borderColor: colors.slate_grey,
        borderWidth: 5,
        marginHorizontal: 100,
        paddingTop: 20
    }
});
