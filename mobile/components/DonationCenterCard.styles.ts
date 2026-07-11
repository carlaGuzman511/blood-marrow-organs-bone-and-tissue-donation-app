import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.secondaryWhite,
    height: 110,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 50,
    marginRight: 16,
    marginLeft: 4,
    backgroundColor: COLORS.black,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 300,
  },
  nameText: {
    ...FONTS.body4,
    fontWeight: 'bold',
    marginLeft: 4,
    marginBottom: 6,
    textAlign: 'center',
    maxWidth: 250,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    maxWidth: 200,
  },
  addressText: {
    ...FONTS.body4,
    maxWidth: 200,
    textAlign: 'center',
  },
  cityText: {
    ...FONTS.body4,
  },
});

export default styles;
