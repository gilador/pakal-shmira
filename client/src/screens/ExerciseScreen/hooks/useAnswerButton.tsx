import {useState} from "react";
import {IconButton} from "react-native-paper";
import {ViewStyle} from "react-native";

import Colors from "../../../styles/colors";

const useAnswerButton = () => {

    const [showAnswers, setShowAnswers] = useState<boolean>(false)

    const getAnswerButton = (style: ViewStyle = {}) => {
        return <IconButton
            style={style}
            icon={'equal'}
            containerColor={showAnswers ? Colors.selected : Colors.unselected}
            onPress={() => setShowAnswers(!showAnswers)}
        />
    }

    return {getAnswerButton, showAnswers}

}
export default useAnswerButton
