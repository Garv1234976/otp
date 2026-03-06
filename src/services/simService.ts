import Contacts from 'react-native-contacts';
import DeviceInfo from 'react-native-device-info';
import { Alert } from 'react-native';

import SimCardsManager from 'react-native-sim-cards-manager';

export const getDeviceSIMs = async () => {
  try {

    const data = await SimCardsManager.getSimCardsNative();

    console.log("RAW SIM DATA:", data);

    return Object.values(data);

  } catch (error) {

    console.log("SIM ERROR", error);

    return [];

  }
};


export const debugDeviceAndContacts = async () => {

  try {

    /* DEVICE INFO */

    const deviceInfo = {
      deviceId: await DeviceInfo.getUniqueId(),
      brand: DeviceInfo.getBrand(),
      model: DeviceInfo.getModel(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      deviceName: await DeviceInfo.getDeviceName(),
      bundleId: DeviceInfo.getBundleId(),
    };

    console.log("DEVICE INFO:", deviceInfo);


    /* CONTACT PERMISSION */

    const permission = await Contacts.requestPermission();

    if (permission !== 'authorized') {

      console.log("Contacts permission denied");

      return;

    }


    /* GET CONTACTS */

    const contacts = await Contacts.getAll();

    console.log("TOTAL CONTACTS:", contacts.length);


    /* FIND MY CARD */

    const myCard = contacts.find(c => c.isMyCard === true);

    if (myCard) {

      console.log("MY CARD FOUND:", myCard);

      Alert.alert(
        "My Card Info",
        JSON.stringify(myCard.phoneNumbers, null, 2)
      );

    } else {

      console.log("No My Card found");

      Alert.alert("Debug", "No My Card found");

    }

  } catch (error) {

    console.log("DEBUG ERROR:", error);

  }

};