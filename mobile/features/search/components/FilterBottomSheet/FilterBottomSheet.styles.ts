import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '@/constants';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.h4.fontFamily,
    color: COLORS.black,
  },
  close: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.body4.fontFamily,
  },
  list: {
    width: '100%',
  },
  listContent: {
    gap: 8,
  },
  option: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondaryWhite,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryWhite,
  },
  optionLabel: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.body4.fontFamily,
  },
  selectedLabel: {
    color: COLORS.primary,
    fontFamily: FONTS.h4.fontFamily,
  },
});

export default styles;