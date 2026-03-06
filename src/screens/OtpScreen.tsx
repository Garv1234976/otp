import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export default function OtpScreen({route, navigation}: Props) {

  const {phone} = route.params;

  const [otp, setOtp] = useState('');

  const verifyOTP = () => {

    if (otp === '123456') {
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Invalid OTP');
    }

  };

  return (

    <View style={styles.container}>

      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FB" />

      <Text style={styles.heading}>Verify OTP</Text>

      <Text style={styles.subText}>
        Enter the code sent to
      </Text>

      <Text style={styles.phone}>
        +{phone}
      </Text>

      <TextInput
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        placeholder="------"
        style={styles.otpInput}
      />

      <TouchableOpacity
        style={[
          styles.verifyButton,
          otp.length !== 6 && {opacity:0.5}
        ]}
        onPress={verifyOTP}
        disabled={otp.length !== 6}
      >
        <Text style={styles.verifyText}>Verify OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendBtn}>
        <Text style={styles.resendText}>Resend OTP</Text>
      </TouchableOpacity>

    </View>

  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:24,
    justifyContent:'center',
    backgroundColor:'#F5F7FB'
  },

  heading:{
    fontSize:28,
    fontWeight:'700',
    marginBottom:8
  },

  subText:{
    color:'#777'
  },

  phone:{
    fontSize:16,
    fontWeight:'600',
    marginBottom:30
  },

  otpInput:{
    backgroundColor:'#fff',
    borderRadius:12,
    borderWidth:1,
    borderColor:'#E6E6E6',
    padding:18,
    fontSize:22,
    letterSpacing:10,
    textAlign:'center',
    marginBottom:25
  },

  verifyButton:{
    backgroundColor:'#4A6CF7',
    padding:16,
    borderRadius:10,
    alignItems:'center'
  },

  verifyText:{
    color:'#fff',
    fontWeight:'600',
    fontSize:16
  },

  resendBtn:{
    marginTop:20,
    alignItems:'center'
  },

  resendText:{
    color:'#4A6CF7',
    fontWeight:'500'
  }

});