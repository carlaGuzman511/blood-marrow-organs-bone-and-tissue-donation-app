import { StyleSheet } from 'react-native';

import { COLORS, FONTS } from '@/constants';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.secondaryWhite,
  },
  label: {
    color: COLORS.black,
    fontSize: 12,
    fontFamily: FONTS.body4.fontFamily,
  },
  icon: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.body4.fontFamily,
  },
});

export default styles;