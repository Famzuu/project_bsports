import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
} from 'lucide-react-native';
import api from '../../services/api';
import { styles } from '../../style/RegisterStyle'; // Import style terpisah

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !passwordConfirmation || !name) {
      Alert.alert('Pemberitahuan', 'Semua kolom wajib diisi!');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Password dan Konfirmasi tidak cocok!');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/register', {
        name,
        email,
        no_hp: noHp,
        unit_kerja: unitKerja,
        password,
        password_confirmation: passwordConfirmation,
      });
      Alert.alert('Sukses', 'Akun berhasil dibuat! Silakan login.', [
        { text: 'Masuk Sekarang', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('\n')
        : error.response?.data?.message || 'Terjadi kesalahan';
      Alert.alert('Registrasi Gagal', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>DAFTAR AKUN</Text>
            <Text style={styles.subtitle}>
              Bergabunglah dengan komunitas B-SPORTS
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama lengkap"
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Buat password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Konfirmasi Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ulangi password"
                secureTextEntry={!showConfirmPassword}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>BUAT AKUN</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <Text style={styles.noAccountText}>Sudah punya akun?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}> Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
