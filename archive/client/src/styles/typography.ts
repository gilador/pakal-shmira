import { StyleSheet, TextStyle } from 'react-native'

import textSizes from './textSizes'
import colors from './colors'

interface FontProps {
    fontSize: number
    lineHeight: number
}

const fonts = {
    light: 'Gilroy-Light',
    bold: 'gilroy-extra-bold',
    heb_dot: 'Dafavohebfont-Regular',
}

function createTextStyle(fontProps: FontProps) {
    return StyleSheet.create({
        DarkRegular: textStyle(fontProps, colors.dark_text, fonts.light),
        DarkBold: textStyle(fontProps, colors.dark_text, fonts.bold),
        GreyRegular: textStyle(fontProps, colors.grey_text, fonts.light),
        GrayHebDot: textStyle(fontProps, colors.grey_text, fonts.heb_dot),
        TransparentRegular: textStyle(fontProps, 'transparent', fonts.light),
    })
}

function textStyle({ fontSize, lineHeight }: FontProps, textColor: string, fontFamily?: string) {
    return {
        fontSize,
        lineHeight,
        fontFamily: fontFamily,
        color: textColor,
    } as TextStyle
}

/**
 * Patterns usage example:
 * const style = StyleSheet.create({
 *   example: {
 *      // first field is needed for defining font size(ex. title is 24)
 *      // the second field is needed for defining font color end weight
 *      // (ex DarkSemiBold is using colors.dark_text and semi bold font.)
 *     ...typography.title.DarkRegular,
 *   }
 * })
 */
export default {
    //62
    h1: createTextStyle(textSizes.h1),
    //56
    h2: createTextStyle(textSizes.h2),
    //48
    h3: createTextStyle(textSizes.h3),
    //34
    h4: createTextStyle(textSizes.h4),
    //24
    title: createTextStyle(textSizes.title),
    //20
    infoTitle: createTextStyle(textSizes.infoTitle),
    //20
    subtitle: createTextStyle(textSizes.subtitle),
    //18
    body_large: createTextStyle(textSizes.body_large),
    //16
    body_medium: createTextStyle(textSizes.body_medium),
    //14
    body_small: createTextStyle(textSizes.body_small),
    //12
    caption: createTextStyle(textSizes.caption),
    //10
    extra_small: createTextStyle(textSizes.extra_small),
}
