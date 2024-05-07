import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import EditableList from '@app/screens/shiftScreen/elements/EditableList'
import { extractWords } from '@app/common/utils'
import { User } from '../models'
import useSyncedState from '@app/hooks/useSyncedState'
import AsyncStorageManager from '@app/services/AsyncStorageManager'

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

const preloaded: User[] = []

export default function useShiftUsersListView(isEditing = false) {
    const [list, setList] = useSyncedState<User[]>('names', [])

    const [selectedNameId, setSelectedNameId] = useState<string | undefined>(undefined)

    const toggleUserSelection = useCallback(
        (userNameId: string | undefined) => {
            setSelectedNameId((selectedNameId) => (selectedNameId === userNameId ? undefined : userNameId))
        },
        [JSON.stringify(list)]
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
            console.log('useShiftUsersListView->onAdd-> preList:', preList)
            const prev = preList ? preList:  []
            return [...ret, ...prev]
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

    const ShiftResourceListView = useMemo(
        () => (
            <View style={styles.container}>
                <ShiftListContext.Provider value={context}>
                    <EditableList list={list} isEditing={isEditing} />
                </ShiftListContext.Provider>
            </View>
        ),
        [list, isEditing, selectedNameId]
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
        flexBasis: 'auto',
        flexShrink: 0,
    },
})
