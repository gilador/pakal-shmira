import React from "react";
import {StyleProp, StyleSheet, View, ViewStyle} from "react-native";

export interface CommonSetProps {
    printRef: any
    style?: StyleProp<ViewStyle>
    getAnswerButton?: (style: ViewStyle) => JSX.Element
}

export default function CommonSet<T extends CommonSetProps>(WrappedComponent: React.ComponentType<T>){
    return (props: T) => {
        return (
            <View style={[props.style, styles.container]}>
                {props.getAnswerButton?.(styles.answerButton)}
                <View ref={props.printRef} style={{height: '100%'}}>
                    <WrappedComponent {...props}/>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        paddingHorizontal: '100px',
        marginVertical: 5

    },
    answerButton: {position: "absolute", top: 0, left: 70}
});
