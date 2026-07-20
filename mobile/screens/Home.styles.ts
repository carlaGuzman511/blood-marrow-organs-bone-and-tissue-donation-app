import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.black,
  },
  list: {
    // backgroundColor: COLORS.black,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: COLORS.white,
    textAlign: 'center',
  },
});
