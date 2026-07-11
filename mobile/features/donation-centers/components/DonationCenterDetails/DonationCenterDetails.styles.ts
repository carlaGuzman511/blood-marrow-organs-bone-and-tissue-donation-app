import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    marginHorizontal: 22,
    marginTop: 22,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContent: {
    margin: 22,
  },
  loadingText: {
    ...FONTS.body4,
    marginTop: 24,
  },
  centerImage: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    marginTop: 22,
    backgroundColor: COLORS.secondaryWhite,
  },
  infoContainer: {
    marginTop: 18,
  },
  titleText: {
    ...FONTS.h2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationText: {
    ...FONTS.body4,
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryAction: {
    backgroundColor: COLORS.secondaryWhite,
  },
  primaryAction: {
    backgroundColor: COLORS.primary,
  },
  actionText: {
    ...FONTS.body4,
    marginTop: 8,
  },
  secondaryActionText: {
    color: COLORS.green,
  },
  primaryActionText: {
    color: COLORS.white,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    ...FONTS.h4,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.secondaryWhite,
    borderRadius: 18,
    padding: 18,
  },
  serviceItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  serviceText: {
    ...FONTS.body4,
  },
  infoLabel: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginBottom: 10,
  },
  infoValue: {
    ...FONTS.body4,
  },
  infoLabelWithSpacing: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 10,
  },
});

export default styles;
