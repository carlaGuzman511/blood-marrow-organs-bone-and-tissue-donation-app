import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f3f5'
  },
  searchContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    backgroundColor: '#f7f7f7',
    padding: 8,
  },
  sectionHeaderText: {
    fontWeight: '600'
  },
  listItem: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  description: { marginTop: 8, color: '#444' },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    color: '#444',
  },
});
