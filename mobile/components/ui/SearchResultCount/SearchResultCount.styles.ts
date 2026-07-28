import { StyleSheet } from 'react-native';

import { COLORS, FONTS } from '@/constants';

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  text: {
    color: COLORS.black,
    fontSize: 13,
    fontFamily: FONTS.body4.fontFamily,
  },
});

export default styles;