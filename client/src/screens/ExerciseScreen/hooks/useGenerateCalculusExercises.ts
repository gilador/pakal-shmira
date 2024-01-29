import {useMemo} from "react";
import {mathExercise, MathOP} from "../model/MathExercise";
import {Dictionary} from "../../../common/Dictionary";

export default function useGenerateCalculusExercises(difficulty: number[], amount: number, selectedOps: Dictionary<MathOP>) {
    return useMemo(() => {
        const exs: mathExercise[] = []

        for (let i = 0; i < amount; i++) {
            const dif = Math.pow(10, difficulty as unknown as number)
            const dif2 = Math.pow(10, Math.max((difficulty as unknown as number) - 1, 1))
            const rand1 = Number((Math.random() * 10000).toFixed(0)).valueOf() + 1
            const rand2 = Number((Math.random() * 10000).toFixed(0)).valueOf() + 1
            const num1 = rand1 % dif
            const num2 = rand2 % dif2
            const pos = parseInt((Math.random() * 10).toFixed(0)) % Object.keys(selectedOps).length
            const op = selectedOps[Object.keys(selectedOps)[pos]]
            exs.push({num1, num2, op})
        }
        return exs
    }, [difficulty, amount, selectedOps])
}
