import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants';

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.secondaryWhite,
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  label: {
    color: COLORS.black,
    fontSize: 12,
    fontFamily: FONTS.body4.fontFamily,
  },
  activeLabel: {
    color: COLORS.white,
  },
});

export default styles;