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
  profileSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.secondaryWhite,
  },
  nameText: {
    ...FONTS.h2,
    marginTop: 18,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  labelText: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  valueText: {
    ...FONTS.h3,
    marginTop: 8,
  },
  bodyText: {
    ...FONTS.body4,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...FONTS.body4,
    marginTop: 10,
  },
  statValue: {
    ...FONTS.h3,
    marginTop: 6,
    textAlign: 'center',
  },
});

export default styles;
