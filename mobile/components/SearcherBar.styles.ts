import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants';

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondaryWhite,
    height: 48,
    marginVertical: 22,
    paddingHorizontal: 22,
    borderRadius: 4,
  },
  input: {
    height: '100%',
    marginHorizontal: 12,
    width: SIZES.width - 144,
  },
  clearButton: {
    height: 48,
    width: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: COLORS.secondaryWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    ...FONTS.body4,
    color: COLORS.black,
  },
  filterOptionTextSelected: {
    color: COLORS.white,
  },
});

export default styles;
