import {StyleSheet, Text, View} from 'react-native';
import {AntDesign} from "@expo/vector-icons";

import {mathExercise} from "../model/MathExercise";
import {typography} from "../../../styles";
import colors from "../../../styles/colors";



export interface VerticalProps{
    exercise: mathExercise
    showAnswers: boolean
}
export default function VerticalExp({ exercise, showAnswers }: VerticalProps) {
    return exercise.op ? (
        <View style={styles.container}>
                <View style={styles.items}>
                    <AntDesign name={exercise.op.icon} size={20} color={colors.black} style={styles.op} />
                    <View style={styles.numbers}>
                        <Text style={styles.number}>{exercise.num1}</Text>
                        <Text style={styles.number}>{exercise.num2}</Text>
                    </View>
                </View>
                <View style={styles.separator}/>
                <View style={styles.numbers}>
                    <Text style={showAnswers ? styles.number : styles.hiddenNumber}>{exercise.op.operator(exercise.num1, exercise.num2)}</Text>
                </View>
            </View>
    ) : (<View style={styles.container}/>)
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingBottom: 100,
    },
    items: {
        flex: 1,
        flexDirection: 'row',
        justifyContent:'flex-end',
    },
    op:{
        alignSelf: "center",
        marginLeft:-10
    },
    numbers: {
        flex: 1,
        flexDirection: 'column',
        alignSelf: 'flex-end',
    },
    separator: {
        alignSelf: 'stretch',
        backgroundColor: 'black',
        height: '1px',
    },
    number:{
        ...typography.body_large.DarkRegular,
        alignSelf: 'flex-end',
    },
    hiddenNumber: {
        ...typography.body_large.TransparentRegular,
    }
});
