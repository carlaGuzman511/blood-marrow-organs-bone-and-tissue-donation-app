
import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants';

const styles = StyleSheet.create({
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.body4.fontFamily,
  },
});

export default styles;