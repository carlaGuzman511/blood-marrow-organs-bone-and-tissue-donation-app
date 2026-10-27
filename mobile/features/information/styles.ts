import { makeStyles } from '@/theme';

export const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    padding: t.spacing.md,
    backgroundColor: t.colors.background,
  },
  searchContainer: {
    marginBottom: t.spacing.md,
  },
  sectionHeader: {
    backgroundColor: t.colors.surfaceRecessed,
    padding: t.spacing.xs,
  },
  sectionHeaderText: {
    ...t.typography.labelMd,
    color: t.colors.text,
  },
  listItem: {
    padding: t.spacing.md,
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.base,
    marginVertical: t.spacing.xs,
  },
  title: { ...t.typography.headlineMd, color: t.colors.text },
  description: { ...t.typography.bodySm, marginTop: t.spacing.xs, color: t.colors.textMuted },
  emptyText: {
    ...t.typography.bodyMd,
    padding: t.spacing.lg,
    textAlign: 'center',
    color: t.colors.textMuted,
  },
}));
