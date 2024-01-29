import React, {useMemo, useState} from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Text, View} from "../components/Themed";
// import Slider from "@react-native-community/slider";
import {Slider} from '@miblanchard/react-native-slider';

import Colors from "../constants/Colors";
import {typography} from "../styles";

export interface SliderRangeModel {
    min: number
    max: number
}

export interface SliderHookModel {
    title: string
    range: SliderRangeModel
    initialVal: number[]
    step: number
    style?: StyleProp<ViewStyle>
}

export default function useSliderHook({range, title, initialVal, step, style}: SliderHookModel) {

    const CustomThumb = (text: string) => {
        // console.log(`gilad->CustomThumb->this.props:${this.props}`)
        return(
        <View style={styles.thumbStyle}>
            <Text selectable={false} style={{...typography.body_medium.DarkRegular}}>{text}</Text>
        </View>
    )}

    const getMarkerValues = (value: number[]) => {
        if(value.length == 1){
            return value
        }
        let low = value[0]
        let high = value[1]
        if (low >= high) {
            const temp = low
            low = Math.min(high)
            high = Math.min(temp) + 1
        }

        return ([low, high])
    }

    const [rangeValue, setRangeValue] = useState<number[]>(getMarkerValues(initialVal));
    //renderThumbComponent={() => CustomThumb(rangeValue.toString())}
    console.log(`gilad->rangeValue: ${JSON.stringify(rangeValue)}, min: ${range.min}, max:${range.max} `)
    const getSliderView = useMemo(() => (
        <View style={[style, styles.container]}>
            <Text
                selectable={false}
                style={styles.signsTitle}
                lightColor="rgba(0,0,0,0.8)"
                darkColor="rgba(255,255,255,0.8)">
                {title}
            </Text>
            <Slider
                step={step}
                value={rangeValue}
                minimumValue={range.min}
                maximumValue={range.max}
                thumbStyle={styles.thumbStyle}
                trackStyle={styles.trackStyle}
                maximumTrackTintColor={Colors.unselected}
                minimumTrackTintColor={Colors.selected}
                renderThumbComponent={() => CustomThumb(getMarkerValues(rangeValue).toString())}
                onValueChange={(val) => {
                    {
                        if (rangeValue[0]&&Math.min(val as number[][0]) !== Math.min(rangeValue[0]) ||
                            rangeValue[1]&&Math.min(val as number[][1]) !== Math.min(rangeValue[1])) { // a hack for array equality assuming first val is good enough
                            const newRange = getMarkerValues(val as number[])
                            setRangeValue(newRange)
                        }
                    }
                }}
            />
        </View>), [rangeValue, range]
    )

    return {
        rangeValue,
        getSliderView
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    signsTitle: {
        fontSize: 17,
        lineHeight: 24,
        alignSelf: 'flex-start',
        flexGrow: 10,
        flexShrink: 10,
    },
    trackStyle: {
        width: 400,
        height: 20,
        borderRadius: 60,
    },
    thumbStyle: {
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 60,
        borderStyle: 'solid',
        borderColor: 'black',
        borderWidth: 1,
        textAlign: "center",
        justifyContent: "center",
    },
});
