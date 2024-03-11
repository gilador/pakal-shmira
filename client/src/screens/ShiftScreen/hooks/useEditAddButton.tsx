import { StyleProp, View, ViewStyle } from 'react-native'
import { memo, useContext, useState } from 'react'
import { IconButton } from 'react-native-paper'

import { ShiftListContext } from './useShiftUsersListView'

type EditAddButtonProps = {}

type EditAddButtonViewProps = {
    style?: StyleProp<ViewStyle>
}

export default function useEditAddButton({}: EditAddButtonProps) {
    const shiftListContext = useContext(ShiftListContext)

    const [isEditing, setIsEditing] = useState(false)

    const EditAddButtonView = memo(({ style }: EditAddButtonViewProps) => (
        <View style={style}>
            <IconButton
                icon={isEditing ? 'checkbox-marked-circle' : 'square-edit-outline'}
                onPress={() => {
                    setIsEditing((pre) => !pre)
                    shiftListContext.onUserToggleSelected(shiftListContext.selectedNameId)
                }}
                containerColor="lightgreen"
            />
        </View>
    ))

    return {
        isEditing,
        EditAddButtonView,
    }
}
