import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(360, width - 44);
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.9);

export default StyleSheet.create({
  touchable: {
    marginLeft: 22,
    marginBottom: 22,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    backgroundColor: COLORS.black,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'flex-end',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
