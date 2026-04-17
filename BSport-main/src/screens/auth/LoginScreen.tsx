import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ Import Safe Area
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import Icon from 'react-native-vector-icons/Ionicons';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan Password wajib diisi!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/login', {
        email: email,
        password: password,
      });

      const token = response.data.access_token;
      const user = response.data.user;

      setAuth(token, user); // 🔥 INI YANG KAMU LUPA
    } catch (error: any) {
      Alert.alert(
        'Login Gagal',
        error.response?.data?.message || 'Email atau password salah.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✅ Bungkus layar dengan SafeAreaView
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>B'Sports</Text>
        <Text style={styles.subtitle}>Masuk untuk mulai melacak</Text>

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

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Belum punya akun? Daftar di sini
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F9' }, // ✅ Style untuk Safe Area
  container: { flex: 1, justifyContent: 'center', padding: 20 },
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
    marginRight: 10, // ✅ biar icon ada jarak
  },

  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
});
