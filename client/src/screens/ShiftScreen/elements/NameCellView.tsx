import { UserInfo } from "@app/screens/shiftScreen/models";
import { memo } from "react";
import { TouchableOpacity, StyleSheet, View, Text} from "react-native";

export type NameCellViewProps = {
    user: UserInfo
    isSelected: boolean
    cb?: () => void
}

const NameCellView = (props: NameCellViewProps) => {
    console.log(`UserCell: ${props.user.name}`)
    return (
        <TouchableOpacity onPress={props.cb} disabled = {!props.cb}>
            <View style={styles.container}>
                <Text style={getTextStyle(props.user, props.isSelected)}>{props.user.name}</Text>
            </View>
        </TouchableOpacity>
    );
}

function getTextStyle(user: UserInfo, isSelected: boolean): any[]{
    return [styles.title, isSelected ? styles.selected : {}]

}

const styles = StyleSheet.create({
    container: { flex: 10, padding: 16, paddingTop: 30 },
    title: { textAlign: 'center' },
    selected: {backgroundColor: 'pink'}
  });

  export default memo(NameCellView)