import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  summary: { marginTop: 6, color: '#444' },
});

export default styles;