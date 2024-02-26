import { UserInfo } from "@app/screens/shiftScreen/models";
import { TouchableOpacity, StyleSheet, View, Text} from "react-native";

export type UserCellProps = {
    user: UserInfo
    isSelected: boolean
    cb?: () => void
}

export function UserCell(props: UserCellProps) {
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