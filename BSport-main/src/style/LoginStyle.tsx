import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BSports_ORANGE = '#F8AD3C';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },

  // HEADER
  headerSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: BSports_ORANGE,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },

  // FORM
  formSection: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  forgotPass: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPassText: {
    color: BSports_ORANGE,
    fontSize: 13,
    fontWeight: '700',
  },

  // BUTTON
  button: {
    backgroundColor: '#111827', // Dark/Black Premium
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // FOOTER
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  noAccountText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  registerText: {
    color: BSports_ORANGE,
    fontSize: 14,
    fontWeight: '800',
  },
});