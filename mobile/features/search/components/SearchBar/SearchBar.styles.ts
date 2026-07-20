import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants';

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterHint: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.body4.fontFamily,
  },
});

export default styles;