import {createNativeStackNavigator} from "@react-navigation/native-stack";

import NotFoundScreen from "../../screens/NotFoundScreen";
import ModalScreen from "../../screens/ModalScreen";
import {RootStackParamList} from "../../../types";
import {ExDrawer} from "./exDrawer";
import CalculusExeScreen from "../../screens/ExerciseScreen/CalculusExeScreen";

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    return (
        <Stack.Navigator initialRouteName={"Main"} screenOptions={{headerShown: false }}>
            <Stack.Screen name="Main" component={CalculusExeScreen}/>
            <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
                <Stack.Screen name="Modal" component={ModalScreen} />
            </Stack.Group>
        </Stack.Navigator>
    );
}
