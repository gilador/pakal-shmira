import { StyleProp, View, ViewStyle } from 'react-native'
import { memo, useContext, useState } from 'react'
import { IconButton } from 'react-native-paper'

import { ShiftListContext } from './useShiftUsersListView'
import { colors } from '@app/styles'

type EditAddButtonViewProps = {
    style?: StyleProp<ViewStyle>
}

export default function useEditModeButton(initialEditMode = false) {
    const shiftListContext = useContext(ShiftListContext)

    const [isEditing, setIsEditing] = useState(initialEditMode)

    const EditAddButtonView = memo(({ style }: EditAddButtonViewProps) => (
        <View style={style}>
            <IconButton
                icon={isEditing ? 'checkbox-marked-circle' : 'square-edit-outline'}
                onPress={() => {
                    setIsEditing((pre) => !pre)
                    shiftListContext.onUserToggleSelected(shiftListContext.selectedNameId)
                }}
                containerColor={colors.ok}
                iconColor="white"
            />
        </View>
    ))

    return {
        isEditing,
        EditAddButtonView,
    }
}
