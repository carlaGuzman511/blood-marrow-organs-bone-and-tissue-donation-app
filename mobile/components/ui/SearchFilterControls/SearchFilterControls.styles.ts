import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants';

export default StyleSheet.create({
  container: { gap: 8, marginBottom: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hint: { color: COLORS.primary, fontSize: 12, fontFamily: FONTS.body4.fontFamily },
});
