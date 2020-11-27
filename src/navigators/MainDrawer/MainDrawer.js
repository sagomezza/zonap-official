import React from "react";
import { Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
// import { MaterialIcons } from "@expo/vector-icons";
import HomeIndex from "../../screens/Home/index";
import QRIndex from "../../screens/Qr/QRIndex";
import LogoutIndex from "../../screens/Logout/LogoutIndex";
import UserInput from "../../screens/UserInput/UserInputIndex";
import UserOut from "../../screens/UserExit/UserExitIndex";
import Qr from "../../screens/Qr/QRIndex";
import ScreenMenu from "../../screens/Menu/MenuStyles";
import { createDrawerNavigator, DrawerContent, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer"; 

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainDrawer = ({ navigation }) => {
  return (
    <Drawer.Navigator
      initialRouteName={"Home"}
      screenOptions={{
        //headerTitle: (props) => <HeaderTitle {...props} />,
        headerStyle: {
          backgroundColor: "#2DD47F",
          // backgroundColor: "#f0f0f0",
          height: 100 ,
        },
        // headerTitleAlign: "center",
        headerTitleAlign: "center",
        headerTitleStyle: {
          color: "white",
        },
        headerTintColor: "white",
        headerBackTitleVisible: false,
      }}
      // drawerContent={(props) => {
      //   const filteredProps = {
      //     ...props,
      //     state: {
      //       ...props.state,
      //       routeNames: props.state.routeNames.filter(
      //         // To hide single option
      //         // (routeName) => routeName !== 'HiddenPage1',
      //         // To hide multiple options you can add & condition
      //         (routeName) => {
      //           console.log(routeName)
      //           routeName !== 'Home'
      //         },
      //       ),
      //       routes: props.state.routes.filter(
      //         (route) =>{
      //           console.log(2)
      //           console.log(route)
      //           route.name !== 'Home'
      //         },
      //       ),
      //     },
      //   };
      //   return (
      //     <DrawerContentScrollView {...filteredProps}>
      //       <DrawerItemList {...filteredProps} />
      //     </DrawerContentScrollView>
      //   );
      // }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeIndex}
        options={{
          headerShown: false,
          headerLeft: null,
          sideMenu: null,
          // drawerLabel: () => null
          // headerLeft: () => (
          //   <MaterialIcons.Button
          //     name="menu"
          //     // color={"#009387"}
          //     backgroundColor="lightgray"
          //     size={25}
          //     onPress={() => navigation.openDrawer()}
          //   />
          // ),
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={LogoutIndex}
        options={{
          headerShown: false,
          headerLeft: null,
        }}
      />
      <Drawer.Screen
        name="UserInput"
        component={UserInput}
        options={{
          headerShown: false,
          headerLeft: null,
        }}
      />
      <Drawer.Screen
        name="UserOut"
        component={UserOut}
        options={{
          headerShown: false,
          headerLeft: null,
        }}
      />
      <Drawer.Screen
        name="QRscanner"
        component={Qr}
        options={{
          headerShown: false,
          headerLeft: null,
        }}
      />
      
    </Drawer.Navigator>
  );
};

export default MainDrawer;
