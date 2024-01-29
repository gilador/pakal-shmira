import React from "react";
import {StyleSheet} from "react-native";
import {AntDesign} from "@expo/vector-icons";
import {createDrawerNavigator} from "@react-navigation/drawer";

import {DrawerParamList} from "../../../types";
import CalculusExeScreen from "../../screens/ExerciseScreen/CalculusExeScreen";
import ABCExeScreen from "../../screens/ExerciseScreen/ABCExeScreen";

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Drawer = createDrawerNavigator<DrawerParamList>()

export function ExDrawer() {

    return (
        <Drawer.Navigator useLegacyImplementation initialRouteName="Calculus">
            <Drawer.Screen
                name="Calculus"
                component={CalculusExeScreen}
                options={({ navigation })=>(
                    {
                        drawerLabel: 'Calculus',
                        title: 'Calculus',
                        drawerIcon: ()=>(<AntDesign name="calculator" size={30} color="black" style={{paddingStart: 40}}/>),
                    })
                }
            />
            <Drawer.Screen
                name="ABC"
                component={ABCExeScreen}
                // options={({ navigation })=>(
                //     {
                //         drawerLabel: 'ABC',
                //         title: 'ABC',
                //         headerLeft: () => (
                //             <View style={styles.container}>
                //                 <AntDesign name="menufold" size={30} color="black" style={{paddingStart: 15}} onPress={ navigation.toggleDrawer}/>
                //                 <AntDesign name="stepforward" size={30} color="black" style={{paddingStart: 40}}/>
                //             </View>
                //         ),
                //     })
                // }
            />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 120,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: "center",
    },
});

