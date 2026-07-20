import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/constants';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width,
    height: Math.min(700, Math.round(width * 0.9)),
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  inner: {
    width: width - 44,
    marginBottom: 40,
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  description: {
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 22,
  },
});
