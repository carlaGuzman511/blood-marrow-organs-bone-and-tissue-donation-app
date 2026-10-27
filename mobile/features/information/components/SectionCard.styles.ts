import { makeStyles } from '@/theme';

export const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.base,
    padding: t.spacing.sm,
    marginVertical: t.spacing.xs,
  },
  title: { ...t.typography.titleSm, color: t.colors.text, marginBottom: t.spacing.xs },
  body: {},
}));
