import { MaterialCommunityIcons } from '@expo/vector-icons';
import {AntDesign} from "@expo/vector-icons";

export interface baseOP {
    sign: string
    icon: keyof typeof AntDesign.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap
    selected: boolean
}

export class MathOP implements baseOP{
    sign: string
    icon: keyof typeof AntDesign.glyphMap
    operator: (a: number, b: number) => number
    selected: boolean
    // Create new instances of the same class as static attributes
    static MIN = new MathOP("-", "minus", (a, b) =>  a - b)
    static PLUS = new MathOP("+", "plus", (a, b) =>  a + b)
    static MULT = new MathOP("X", "close", (a, b) =>  a * b)

    constructor(sign: string, icon: keyof typeof AntDesign.glyphMap, operator: (a: number, b: number) => number, selected = false ) {
        this.sign = sign
        this.icon = icon
        this.selected = selected
        this.operator = operator
    }
}

export interface mathExercise {
    op: MathOP,
    num1: number,
    num2: number
}
