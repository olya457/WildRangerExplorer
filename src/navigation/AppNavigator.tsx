import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {enableScreens} from 'react-native-screens';
import React from 'react';
import {AtlasScreen} from '../screens/AtlasScreen';
import {BriefingScreen} from '../screens/BriefingScreen';
import {ChallengeResultScreen} from '../screens/ChallengeResultScreen';
import {ChallengeScreen} from '../screens/ChallengeScreen';
import {ExpeditionsScreen} from '../screens/ExpeditionsScreen';
import {FieldNotesScreen} from '../screens/FieldNotesScreen';
import {FloatingTabBar} from './FloatingTabBar';
import {LaunchScreen} from '../screens/LaunchScreen';
import {RescueRunHubScreen} from '../screens/RescueRunHubScreen';
import {RescueRunPlayScreen} from '../screens/RescueRunPlayScreen';
import {RescueRunResultScreen} from '../screens/RescueRunResultScreen';
import {SiteBriefScreen} from '../screens/SiteBriefScreen';
import {SpeciesBriefScreen} from '../screens/SpeciesBriefScreen';
import {SpeciesScreen} from '../screens/SpeciesScreen';
import {colors} from '../theme/theme';
import type {MainTabParamList, RootStackParamList} from '../types/navigation';

if (!process.env.JEST_WORKER_ID) {
  enableScreens();
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.orange,
  },
};

function TrailTabsHost() {
  return (
    <Tab.Navigator
      initialRouteName="Expeditions"
      tabBar={renderTabBar}
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="Expeditions" component={ExpeditionsScreen} />
      <Tab.Screen name="Species" component={SpeciesScreen} />
      <Tab.Screen name="Atlas" component={AtlasScreen} />
      <Tab.Screen name="FieldNotes" component={FieldNotesScreen} />
      <Tab.Screen name="RescueRun" component={RescueRunHubScreen} />
    </Tab.Navigator>
  );
}

function renderTabBar(props: React.ComponentProps<typeof FloatingTabBar>) {
  return <FloatingTabBar {...props} />;
}

export function AppNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator initialRouteName="Launch" screenOptions={{headerShown: false, animation: 'fade'}}>
        <Stack.Screen name="Launch" component={LaunchScreen} />
        <Stack.Screen name="Briefing" component={BriefingScreen} />
        <Stack.Screen name="TrailTabs" component={TrailTabsHost} />
        <Stack.Screen name="SiteBrief" component={SiteBriefScreen} options={{animation: 'slide_from_right'}} />
        <Stack.Screen name="SpeciesBrief" component={SpeciesBriefScreen} options={{animation: 'slide_from_right'}} />
        <Stack.Screen name="Challenge" component={ChallengeScreen} options={{animation: 'slide_from_bottom'}} />
        <Stack.Screen name="ChallengeResult" component={ChallengeResultScreen} />
        <Stack.Screen name="RescueRunPlay" component={RescueRunPlayScreen} options={{animation: 'slide_from_right'}} />
        <Stack.Screen name="RescueRunResult" component={RescueRunResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
