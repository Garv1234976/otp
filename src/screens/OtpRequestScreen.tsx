import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OtpRequestScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const [otpTypesLoading, setOtpTypesLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpType, setOtpType] = useState('');
  const [otpTime, setOtpTime] = useState('');
  const [otpTypes, setOtpTypes] = useState([]);

  const copyOtp = () => {
    if (!otp) return;

    Clipboard.setString(otp);
    Alert.alert('Copied', 'OTP copied to clipboard');
  };
  const getOTP = async () => {
    // if (!title) {
    //   Alert.alert('Title required');
    //   return;
    // }

    try {
      setLoading(true);

      const body = `act=get_Act_Otp&regnum=${user?.phone}&userid=${
        user?.userId
      }&idPass=${user?.password}&otp_type=${otpType}&title=${encodeURIComponent(
        title,
      )}`;

      const res = await axios.post(
        'https://futuredigiassets.com/fda/userdash/members/ajaxfuntions-dynamic.php',
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const data = res.data;

      console.log(data);

      if (data.status === 'success') {
        setOtp(data.otpValue);
        setOtpType(data.siteOtpType);
        setOtpTime(data.otpTime);

        await saveOtpToStorage(data);
        // Alert.alert('Success', data.msg);
      } else {
        Alert.alert('Error', data.message || 'OTP failed');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const saveOtpToStorage = async data => {
    try {
      const stored = await AsyncStorage.getItem('OTP_LIST');

      let otpList = stored ? JSON.parse(stored) : [];

      const newOtp = {
        id: Date.now(),
        title: data.message,
        otp: data.otpValue,
        type: data.siteOtpType,
        createdAt: new Date(data.curTime).getTime(),
        expireAt: new Date(data.otpTime).getTime(),
      };

      const now = Date.now();

      // remove expired
      otpList = otpList.filter(item => item.expireAt > now);

      // remove previous OTP with same type
      otpList = otpList.filter(item => item.type !== newOtp.type);

      // add latest OTP on top
      otpList.unshift(newOtp);

      await AsyncStorage.setItem('OTP_LIST', JSON.stringify(otpList));
    } catch (err) {
      console.log('OTP Save Error', err);
    }
  };
  const getOtpTypes = async () => {
    try {
      setOtpTypesLoading(true);

      const body = 'act=otpTypes';

      const res = await axios.post(
        'https://futuredigiassets.com/fda/userdash/members/ajaxfuntions-dynamic.php',
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log(res.data);

      if (res.data?.otpTypes) {
        setOtpTypes(res.data.otpTypes);
        setOtpType(res.data.otpTypes[0]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOtpTypesLoading(false);
    }
  };
  useEffect(() => {
    getOtpTypes();
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FB" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>&larr;</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Generate OTP</Text>
      </View>

      {/* <Text style={styles.user}>User ID : {user?.userId}</Text> */}

      {/* <Text style={styles.phone}>Phone : +91 {user?.phone}</Text> */}
      <Text style={styles.phone}>Select Site for OTP</Text>

      {/* Title Input */}

      <View style={styles.pickerBox}>
        {otpTypesLoading ? (
          <View style={{ padding: 15, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={{ marginTop: 5, color: '#777' }}>
              Loading OTP Types...
            </Text>
          </View>
        ) : (
          <Picker
            selectedValue={otpType}
            onValueChange={itemValue => setOtpType(itemValue)}
          >
            {otpTypes.map((type, index) => (
              <Picker.Item label={type} value={type} key={index} />
            ))}
          </Picker>
        )}
      </View>

      {/* Button */}

      <TouchableOpacity
        style={styles.button}
        onPress={getOTP}
        disabled={loading || otpTypesLoading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Get OTP</Text>
        )}
      </TouchableOpacity>

      {/* Result */}

      {otp !== '' && (
        <View style={styles.card}>
          <Text style={styles.label}>OTP for {otpType}</Text>

          <TouchableOpacity
            onPress={copyOtp}
            style={{ flexDirection: 'column', alignItems: 'center' }}
          >
            <Text style={styles.otp}>{otp}</Text>
            <Text style={styles.copyHint}>Tap to copy</Text>
          </TouchableOpacity>

          {/* <View style={{marginBlock: 20}}>
            <Text style={styles.meta}>Type : {otpType}</Text>

          <Text style={styles.meta}>Time : {otpTime}</Text>
          </View> */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F7FB',
    marginBlock: 30,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },

  user: {
    fontSize: 16,
  },

  phone: {
    fontSize: 16,
    marginBottom: 20,
  },

  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    elevation: 4,
  },

  label: {
    color: '#777',
  },

  otp: {
    fontSize: 36,
    fontWeight: '700',
    marginVertical: 10,
    letterSpacing: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingInline: 20,
    backgroundColor: '#deeef5',
  },

  meta: {
    color: '#666',
  },
  pickerBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
  },
  copyHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    fontWeight: 700,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backBtn: {
    fontSize: 24,
    marginRight: 15,
    fontWeight: 700,
  },
});
