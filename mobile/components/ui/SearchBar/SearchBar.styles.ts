import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants';

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryWhite,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    color: COLORS.black,
    fontSize: 15,
    fontFamily: FONTS.body4.fontFamily,
  },
});

export default styles;
