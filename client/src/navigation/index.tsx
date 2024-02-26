import * as React from 'react';
import {FontAwesome} from '@expo/vector-icons';
import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';

import linking from './LinkingConfiguration';
import {RootNavigator} from "./stacks/rootStack";

export default function Navigation() {
  return (
    <NavigationContainer
      linking={linking}>
      <RootNavigator />
    </NavigationContainer>
  );
}


/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
export function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
