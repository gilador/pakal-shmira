import { IconButton } from 'react-native-paper'
import { View, StyleSheet } from 'react-native'
import { memo, useContext } from 'react'

import ActionButton, { IconType } from '../../../common/components/ActionButton'
import { ShiftListContext } from '../hookComponents/useShiftUsersListView'
import NameCellView from './common/NameCellView'
import { User } from '../models'

type ItemProps = {
    user: User
    isEditing: boolean
}

const EditableListItem = ({ user, isEditing }: ItemProps) => {
    const shiftListContext = useContext(ShiftListContext)

    return (
        <View style={[styles.itemContainer]}>
            <NameCellView
                user={user.name}
                isSelected={shiftListContext.selectedNameId === user.id}
                cb={() => {
                    shiftListContext.onUserToggleSelected(user.id)
                }}
                style={styles.nameCell}
            />
            <ActionButton
                style={!isEditing ? styles.hide : undefined}
                type={IconType.close}
                cb={() => shiftListContext.onUserRemoved(user.id)}
                enabled={isEditing}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        height: '100%',
        paddingBottom: 40,
    },
    hide: {
        opacity: 0,
    },
    list: {
        flexGrow: 1,
    },
    button: {
        alignSelf: 'flex-end',
        flexShrink: 0,
    },
    input: {
        flexGrow: 0,
        flexShrink: 0,
        width: '100%',
    },
    itemContainer: {
        marginVertical: 4,
        flexDirection: 'row',
        flexGrow: 0,
        alignItems: 'center',
    },
    nameCell: {
        flexBasis: 'auto',
        flexGrow: 1,
    },
    cellButton: {
        height: '100%',
        alignSelf: 'center',
    },
})

export default memo(EditableListItem)
