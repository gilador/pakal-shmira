import React, { memo, useContext, useEffect, useRef } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { TextInput } from 'react-native-paper'

import { ShiftListContext } from '../hooks/useShiftUsersListView'
import { User } from '@app/screens/shiftScreen/models'
import EditableListItem from './EditableListItem'

type EditableListProps = {
    list: User[]
    isEditing: boolean
}

//-----
const EditableList = memo(({ list, isEditing }: EditableListProps) => {
    const shiftListContext = useContext(ShiftListContext)

    const [textValue, setTextValue] = React.useState<string | undefined>(undefined)
    const textInputRef = useRef<any>(null)

    useEffect(() => {
        !isEditing && shiftListContext.onUserAdded(textValue)
        setTextValue('')
    }, [isEditing])

    return (
        <View style={styles.container}>
            {isEditing && (
                <TextInput
                    ref={textInputRef}
                    mode="outlined"
                    placeholderTextColor="lightgray"
                    style={styles.input}
                    value={textValue}
                    placeholder="הזן שמות ברווחים"
                    onChangeText={(val: string) => {
                        console.log(`r-onChangeText-> is`)
                        setTextValue(val)
                    }}
                    onBlur={() => {
                        console.log(`r-onBlur-> is`)
                        shiftListContext.onUserAdded(textValue)
                        setTextValue('')
                        textInputRef?.current?.focus()
                    }}
                />
            )}
            <FlatList
                style={styles.list}
                data={list}
                renderItem={({ item }) => <EditableListItem user={item} isEditing={isEditing} />}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        height: '100%',
        paddingBottom: 40,
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

export default EditableList
