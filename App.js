import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, ActivityIndicator} from 'react-native';
import SnackBar from 'react-native-snackbar-component'
import NoConnectionModal from './src/components/NoConnectionModal';
import { Provider } from "react-redux";
import store from './src/config/store'
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/components/AuthContext";
import { auth } from "./src/config/firebase";
import RootStack from "./src/navigators/RootStack"
import * as Font from 'expo-font';
import AppLoading from "expo-app-loading";
import instance from "./src/config/axios";
import { READ_OFFICIAL, READ_HQ } from "./src/config/api";
import { READ_ADMIN, READ_CORPO, STORAGE_KEY } from "./src/config/api/index";
import { setOfficial, setExpoToken } from "./src/redux/actions";
import InternetConnectionAlert from "react-native-internet-connection-alert";
import moment from 'moment';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Permissions from "expo-permissions";
import * as Sentry from "@sentry/browser";
import { LogBox } from 'react-native';
import * as Updates from 'expo-updates';
import * as actions from './src/redux/actions';
import getRecipsOfShift from './src/config/services/getRecipsOfShift';
import readHqInfo from './src/config/services/readHqInfo';
import { firestore } from './src/config/firebase/index';

LogBox.ignoreLogs([
  'Animated: `useNativeDriver` was not specified.',
  'Setting a timer'
]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const fetchFont = () => {
  return Font.loadAsync({
    'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-Light': require('./assets/fonts/Montserrat-Light.ttf'),
    'Montserrat-Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
  })
};

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [currentUser, setUser] = useState("");
  const [initialRouteName, setInitialRouteName] = useState("");
  const [loginState, setLoginState] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [logoutSnackbar, setLogoutSnackbar] = useState(false);
  const [userInSnackbar, setUserInSnackbar] = useState(false);
  const [userInPlate, setUserInPlate] = useState('');
  const [officialData, setOfficialData] = useState({});
  const officialHq = officialData.hq !== undefined ? officialData.hq[0] : "";
  const officialScheduleStart = officialData.start !== undefined ? officialData.start : null;
  const MINUTE_MS = 60000;

  useEffect(() => {
    // console.log('OFFICIAL DATA', officialHq);
    const updateApp = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        // console.log(update)
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // ... notify user of update ...
          await Updates.reloadAsync();
        }
      } catch (e) {
        // handle or log error
        // console.log(e)
      }
    };

    if (officialScheduleStart !== null) {
      // console.log("start IN if", moment(new Date(officialScheduleStart._seconds * 1000)).subtract(5, 'hours'))
      const offStart = moment(new Date(officialScheduleStart._seconds * 1000)).subtract(5, 'hours')
      const checkOfficialHours = setInterval(() => {
        let hours = moment(new Date()).diff(offStart, 'hours', true);
        // console.log(hours)
        if (
          Number(hours) > 7.25 && Number(hours) <= 7.5 ||
          Number(hours) > 7.5 && Number(hours) <= 7.75 ||
          Number(hours) > 7.75 && Number(hours) <= 8 ||
          Number(hours) > 8
        ) {
          setLogoutSnackbar(true);
        }
      }, MINUTE_MS);
      return () => clearInterval(checkOfficialHours);
    }

    const unsubscribe =
      firestore
        .collection("headquarters")
        .onSnapshot(
          (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "modified") {
                let reservations = change.doc.data().reservations;
                let lastUserIn = reservations[reservations.length - 1];
                if (!lastUserIn.officialEmail) {
                  let dateLastUser = lastUserIn.dateStart;
                  let momDateLastUser = moment(new Date(dateLastUser.seconds * 1000)).subtract(5, 'hours');
                  let dateNow = moment(new Date()).subtract(5, 'hours');
                  // console.log('momDateLastUser------', momDateLastUser);
                  // console.log('NEW DATE--------', dateNow)
                  let minutes = moment(dateNow).diff(momDateLastUser, 'minutes', true);
                  // console.log('MINUTES------', minutes);
                  if (minutes !== undefined && minutes < 1) {
                    setUserInPlate(lastUserIn.plate);
                    setUserInSnackbar(true);
                  }
                  // console.log("New INFO---------------------------:: ", lastUserIn);
                }
                // console.log("Modified city: ");
              }
            });
          },
          (error) => { console.log('ERROR onSnapshot'); }
        );

    return () => {
    unsubscribe();
    updateApp();
    }
  }, []);

  Sentry.init({
    dsn: 'https://022b0475f7b147aba62d6d1988bf95df@o479500.ingest.sentry.io/5644578',
    enableInExpoDevelopment: true,
    debug: false, // Sentry will try to print out useful debugging information if something goes wrong with sending an event. Set this to `false` in production.
  });

  const readUser = async (userEmail) => {
    if (userEmail) {
      try {
        const response = await instance.post(READ_OFFICIAL, {
          email: userEmail
        });
        // console.log(response.data.data)
        store.dispatch(setOfficial(response.data.data));
        setOfficialData(response.data.data)
        // if (response.data.data.hq) {
        //   let hqId = response.data.data.hq[0]
        //   readHqInfo(hqId);
        //   getRecipsOfShift(officialData);
        // }
      } catch (err) {
        Sentry.captureException(err)
        try {
          let readOff = await instance.post(READ_ADMIN, {
            email: userEmail
          });
          let data = readOff.data.data
          if (data.hq) {
            let hqId = data.hq
          }
          readOff = await instance.post(READ_CORPO, {
            name: data.context
          });
          data.hq = readOff.data.data.hqs
          store.dispatch(setOfficial(data));
          setOfficialData(data)
        } catch (err) {
          Sentry.captureException(err);
          // console.log(err)
          // console.log(err?.response)
        }
      }
    }
    setLoginState(false);
  }

  const updateUserState = useCallback((user) => {
    if (user) {
      setUser(user);
      setInitialRouteName("Home");
      readUser(user.email);
      // user.updateProfile({deviceId: "dd96dec43fb81c97"})
      // console.log(auth.currentUser)
    } else {
      setUser(null);
      setInitialRouteName("Login");
      setLoginState(false);
    }
  }, []);


  useEffect(() => {
    setLoginState(true);
    // listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(updateUserState);
    // unsubscribe to the listener when unmounting
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // console.log(response);
    });
    // unsubscribe to the listener when unmounting
    return () => {
      unsubscribe();
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        //alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      store.dispatch(setExpoToken(token));
    } else {
      //alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  if (loginState || initialRouteName === "") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size={50} color={"#00A9A0"} />
      </View>
    );
  }

  if (!fontLoaded) {
    return <AppLoading
      startAsync={fetchFont}
      onError={() => console.log('ERROR')}
      onFinish={() => {
        setFontLoaded(true)
      }}
    />;
  }

  return (
    <InternetConnectionAlert
      onChange={(connectionState) => {
        // console.log("Connection State: ", connectionState);
      }}
      title={"Upss no hay conexión..."}
      message="Verifica tu conexión a internet."
      type="error"
    >
      <Provider store={store}>
        <AuthProvider value={{ currentUser }}>
          <NavigationContainer >
            <RootStack initialRouteName={initialRouteName} />
          </NavigationContainer>
          <SnackBar
            visible={logoutSnackbar}
            position='bottom'
            bottom={1}
            textMessage="Recuerda realizar el cierre de caja y posterior cierre de sesión antes de terminar tu turno."
            actionHandler={() => { setLogoutSnackbar(false) }}
            actionText="Entendido"
            actionStyle={{ fontSize: 100, fontFamily: 'Montserrat-Bold' }}
            backgroundColor="#FFF200"
            accentColor="#00A9A0"
            messageColor="#00A9A0"
            messageStyle={{ fontSize: 100, fontFamily: 'Montserrat-Regular' }}
            containerStyle={{ height: 80, borderRadius: 10, margin: 2 }}
          />
          <SnackBar
            visible={userInSnackbar}
            position='bottom'
            bottom={1}
            textMessage={`Acaba de ingresar un usuario con placa: ${userInPlate}`}
            actionHandler={() => { setUserInSnackbar(false); }}
            actionText="Entendido"
            actionStyle={{ fontSize: 100, fontFamily: 'Montserrat-Bold' }}
            backgroundColor="#ED8E20"
            accentColor="#FFFFFF"
            messageColor="#FFFFFF"
            messageStyle={{ fontSize: 100, fontFamily: 'Montserrat-Bold' }}
            containerStyle={{ height: 80, borderRadius: 10, margin: 2 }}
          />
        </AuthProvider>
      </Provider>
    </InternetConnectionAlert>

  );


}

export default App;