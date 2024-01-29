//https://www.ascii-codes.com/cp862.html#extended_character_set

import {typography} from "../../../styles";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {baseOP} from "./MathExercise";
import {TextStyle} from "react-native";

const heb_alphabet = [
    "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ך", "ל", "מ", "ם",
    "נ", "ן", "ס", "ע", "פ", "ף", "צ", "ץ", "ק", "ר", "ש", "ת"
]

const en_alphabet = [
    "a", "A", "b", "B", "c", "C", "d", "D", "e", "E", "f", "F", "g", "G",
    "h", "H", "i", "I", "j", "J", "k", "K", "l", "L", "m", "M", "n", "N",
    "o", "O", "p", "P", "q", "Q", "r", "R", "s", "S", "t", "T", "u", "U",
    "v", "V", "w", "W", "x", "X", "y", "Y", "z", "Z"
]

export class LangOP implements baseOP{
    sign: string
    icon: keyof typeof MaterialCommunityIcons.glyphMap
    selected: boolean
    alphabet: string[]
    font: TextStyle

    // Create new instances of the same class as static attributes
    static Heb = new LangOP("ע", "abjad-hebrew", false, heb_alphabet, typography.h1.GrayHebDot)
    static EN = new LangOP("e", "format-letter-case", false, en_alphabet, typography.h1.GreenRegular)

    constructor(sign: string, icon: keyof typeof MaterialCommunityIcons.glyphMap, selected = false, alphabet: string[], font: TextStyle) {
        this.sign = sign
        this.icon = icon
        this.selected = selected
        this.alphabet = alphabet
        this.font = font
    }
}
