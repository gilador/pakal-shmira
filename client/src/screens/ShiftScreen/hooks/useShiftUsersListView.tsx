import React, { createContext, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import EditableList from '@app/screens/shiftScreen/elements/EditableList'
import { extractWords } from '@app/common/utils'
import { User } from '../models'

export type ShiftListContextType = {
    readonly onUserToggleSelected: (userNameId: string | undefined) => void
    readonly onUserAdded: (userNameId: string | undefined) => void
    readonly onUserRemoved: (userNameId: string) => void
    readonly selectedNameId: string | undefined
}

export const ShiftListContext = createContext<ShiftListContextType>({
    onUserToggleSelected: () => {},
    onUserAdded: () => {},
    onUserRemoved: () => {},
    selectedNameId: undefined,
})

// const mocked = [
//   { user:{ name: 'אלון', id: '1' }, assignments: undefined, constraints: undefined, totalAssignments: 0},
//   { user:{name: 'צביקה', id: '2' }, assignments: undefined, constraints: undefined, totalAssignments: 0},
//   { user:{name: 'תמיר', id: '3' }, assignments: undefined, constraints: undefined, totalAssignments: 0},
//   { user:{name: 'רחמים', id: '4'}, assignments: undefined, constraints: undefined, totalAssignments: 0},
//   { user:{name: 'מתי', id: '5' }, assignments: undefined, constraints: undefined, totalAssignments: 0},
//   { user:{name: 'כספי', id: '6' }, assignments: undefined, constraints: undefined, totalAssignments: 0},
//   { user:{name: 'אליהו', id: '7' }, assignments: undefined, constraints: undefined, totalAssignments: 0},

const mocked = [
    { name: 'אלון', id: 1 + 'אלון' },
    { name: 'צביקה', id: 2 + 'צביקה' },
    { name: 'תמיר', id: 3 + 'תמיר' },
    { name: 'רחמים', id: 4 + 'רחמים' },
    { name: 'מתי', id: 5 + 'מתי' },
    { name: 'כספי', id: 6 + 'כספי' },
    { name: 'גדי', id: 8 + 'גדי' },
    { name: 'יוסף', id: 7 + 'יוסף' },
    { name: 'חיים', id: 9 + 'חיים' },
    { name: 'אלון', id: 11 + 'אלון' },
    { name: 'יששכר', id: 14 + 'יששכר' },
]

export default function useShiftUsersListView(isEditing = false) {
    const [list, setList] = useState<User[]>(mocked)

    const [selectedNameId, setSelectedNameId] = useState<string | undefined>(undefined)

    const toggleUserSelection = useCallback(
        (userNameId: string | undefined) => {
            setSelectedNameId((selectedNameId) => (selectedNameId === userNameId ? undefined : userNameId))
        },
        [list]
    )

    const onAdd = (user: string | undefined) => {
        if (!user) {
            return
        }
        const names = extractWords(user)
        const ret = names.map((ele) => ({
            name: ele,
            id: `${ele}+${Date.now()}`,
        }))

        setList((preList) => {
            return [...ret, ...preList]
        })
    }

    const onRemove = (userId: string) => {
        setList((preList) => {
            const index = preList.findIndex((el) => el.id === userId)
            if (index >= 0) {
                index >= 0 && preList.splice(index, 1)
            }
            return [...preList]
        })
    }

    const context: ShiftListContextType = {
        onUserToggleSelected: toggleUserSelection,
        onUserAdded: onAdd,
        onUserRemoved: onRemove,
        selectedNameId: selectedNameId,
    }

    const ShiftResourceListView = (
        <View style={styles.container}>
            <ShiftListContext.Provider value={context}>
                <EditableList list={list} isEditing={isEditing} />
            </ShiftListContext.Provider>
        </View>
    )

    return {
        list,
        selectedNameId,
        view: ShiftResourceListView,
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        backgroundColor: 'pink',
        flexBasis: 'auto',
    },
})
