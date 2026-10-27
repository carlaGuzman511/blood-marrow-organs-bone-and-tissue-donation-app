import { makeStyles } from '@/theme';

export const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    padding: t.spacing.sm,
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.base,
    marginVertical: t.spacing.xs,
    alignItems: 'center',
  },
  image: { width: 80, height: 80, borderRadius: t.radius.base, marginRight: t.spacing.sm },
  content: { flex: 1 },
  title: { ...t.typography.titleSm, color: t.colors.text },
  summary: { ...t.typography.bodySm, marginTop: 6, color: t.colors.textMuted },
}));
