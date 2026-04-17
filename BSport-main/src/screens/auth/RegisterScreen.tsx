import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ Import Safe Area
import api from '../../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [noHp, setNoHp] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if ( !email || !password || !passwordConfirmation) {
      Alert.alert('Error', 'Semua kolom wajib diisi!');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/register', {
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      Alert.alert(
        'Sukses',
        'Registrasi berhasil! Silakan login untuk melanjutkan.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: any) {
      console.log('FULL ERROR:', error);
      console.log('RESPONSE:', error.response?.data);

      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('\n')
        : error.response?.data?.message || 'Terjadi kesalahan';

      Alert.alert('Registrasi Gagal', errorMessage);
    } finally {
      setIsLoading(false); // ✅ PASTIKAN SELALU MATI
    }
  };

  return (
    // ✅ Bungkus layar dengan SafeAreaView
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>B'Sports</Text>
        <Text style={styles.subtitle}>Buat akun baru Anda</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Konfirmasi Password"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Icon
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>DAFTAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Sudah punya akun? Masuk di sini</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F9' }, // ✅ Style untuk Safe Area
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F8AD3C',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 15,
  },

  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
});
