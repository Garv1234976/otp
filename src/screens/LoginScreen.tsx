import Contacts from 'react-native-contacts';
import DeviceInfo from 'react-native-device-info';
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Alert,
  PermissionsAndroid,
  Platform,
  Modal,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard
} from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {debugDeviceAndContacts, getDeviceSIMs} from '../services/simService';
import { AuthContext } from '../context/AuthContext';



type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({navigation}: Props) {

    const {login} = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [sims, setSims] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {

    if (Platform.OS !== 'android') return;

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
    ]);

    if (granted['android.permission.READ_PHONE_STATE'] === 'granted') {
      loadSIM();
    }
  };

  useEffect(() => {
  debugDeviceAndContacts();
}, []);
const loadSIM = async () => {

  const simData = await getDeviceSIMs();

  let esimFound = false;

  const formattedSIMs = simData.map((sim:any) => {

    const isEsim =
      sim.isEmbedded === true ||
      sim.cardId === -1 ||
      sim.simSlotIndex === -1;

    if (isEsim) esimFound = true;

    return {
      ...sim,
      isEsim
    };
  });

  setSims(formattedSIMs);

  if (esimFound) {
    console.log(" eSIM detected on this device");
    Alert.alert("DEBUG", "This device HAS an eSIM");
  } else {
    console.log(" No eSIM detected");
    Alert.alert("DEBUG", "This device does NOT have an eSIM");
  }



};
const selectSIM = (sim:any) => {

  let number = sim.phoneNumber || '';

  // always keep last 10 digits
  number = number.slice(-10);

  setPhone(number);

  setModalVisible(false);

};

const loginUser = async () => {

  if (loading) return;

  if (!phone || !userId || !password) {
    Alert.alert('Fill all fields');
    return;
  }

  Keyboard.dismiss();

  try {

    setLoading(true);

    const body =
      `act=Opt_id_login&regNum=${phone}&regId=${userId}&idPass=${password}`;

    const res = await axios({
      method: 'POST',
      url: 'https://futuredigiassets.com/fda/userdash/members/ajaxfuntions-dynamic.php',
      data: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (res.data?.success === "YES") {

      await login({
        phone,
        userId,
        password,
        apiUserId: res.data.userid
      });

      navigation.replace('Dashboard');

    } else {

      Alert.alert(res.data?.message || "Login failed");

    }

  } catch (err:any) {

    console.log("Login Error:", err);
    Alert.alert("Network error");

  } finally {

    setLoading(false);

  }

};

return (
<>
  <KeyboardAvoidingView
    style={{flex:1, paddingBlock: 50}}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={20}
  >

    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FB" />

      <Text style={styles.heading}>Login</Text>

      {/* SIM selector */}

      <TouchableOpacity
        style={styles.phoneSelector}
        onPress={() => setModalVisible(true)}
      >
<Text style={styles.phoneText}>
  {phone ? `+91 ${phone}` : "Select SIM Number"}
</Text>
      </TouchableOpacity>

      {/* User ID */}

<TextInput
  placeholder="User ID"
  value={userId}
  onChangeText={(text) => setUserId(text.replace(/[^0-9]/g, ''))}
  keyboardType="number-pad"
  style={styles.input}
  returnKeyType="next"
  placeholderTextColor={'#333'}
/>

      {/* Password */}

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        returnKeyType="done"
        placeholderTextColor={'#333'}
      />

      {/* Login button */}

<TouchableOpacity
  style={[
    styles.loginButton,
    loading && {opacity:0.7}
  ]}
  onPress={loginUser}
  disabled={loading}
>

  {loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.loginText}>Login</Text>
  )}

</TouchableOpacity>

    </ScrollView>

  </KeyboardAvoidingView>
  <Modal
  visible={modalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>

    <View style={styles.bottomSheet}>

      <Text style={styles.sheetTitle}>Choose SIM</Text>

      {sims.map((sim, index) => (

        <TouchableOpacity
          key={index}
          style={styles.simCard}
          onPress={() => selectSIM(sim)}
        >

          <Text style={styles.simCarrier}>
  {sim.carrierName} {sim.isEsim ? "(eSIM)" : "(Physical SIM)"}
</Text>

          <Text style={styles.simNumber}>
            +{sim.phoneNumber}
          </Text>

        </TouchableOpacity>

      ))}

      <TouchableOpacity
        style={{marginTop:10}}
        onPress={() => setModalVisible(false)}
      >
        <Text style={{textAlign:'center'}}>Cancel</Text>
      </TouchableOpacity>

    </View>

  </View>
</Modal>
</>
);
}

const styles = StyleSheet.create({

  container:{
    flexGrow:1,
    padding:24,
    // justifyContent:'center',
    backgroundColor:'#F5F7FB'
  },

  heading:{
    fontSize:28,
    fontWeight:'700',
    marginBottom:30
  },

  phoneSelector:{
    backgroundColor:'#fff',
    padding:16,
    borderRadius:10,
    marginBottom:16
  },

  phoneText:{
    fontSize:16
  },

  input:{
    backgroundColor:'#fff',
    padding:16,
    borderRadius:10,
    marginBottom:16
  },

  loginButton:{
    backgroundColor:'#4A6CF7',
    padding:16,
    borderRadius:10,
    alignItems:'center'
  },

  loginText:{
    color:'#fff',
    fontWeight:'600'
  },

  modalOverlay:{
    flex:1,
    justifyContent:'flex-end',
    backgroundColor:'rgba(0,0,0,0.4)'
  },

  bottomSheet:{
    backgroundColor:'#fff',
    padding:20,
    borderTopLeftRadius:20,
    borderTopRightRadius:20
  },

  sheetTitle:{
    fontSize:18,
    fontWeight:'600',
    marginBottom:20
  },

  simCard:{
    padding:15,
    backgroundColor:'#F7F8FA',
    borderRadius:10,
    marginBottom:10
  },

  simCarrier:{
    fontWeight:'600'
  },

  simNumber:{
    color:'#777'
  }

});