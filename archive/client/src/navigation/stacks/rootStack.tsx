import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import ShiftScreen from '@app/screens/shiftScreen/ShiftScreen'
import NotFoundScreen from '@app/screens/NotFoundScreen'
import ModalScreen from '@app/screens/ModalScreen'
import { RootStackParamList } from 'types'

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
    return (
        <Stack.Navigator initialRouteName={'Main'} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={ShiftScreen} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
                <Stack.Screen name="Modal" component={ModalScreen} />
            </Stack.Group>
        </Stack.Navigator>
    )
}
