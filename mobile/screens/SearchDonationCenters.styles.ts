import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    marginHorizontal: 22,
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
});

export default styles;
