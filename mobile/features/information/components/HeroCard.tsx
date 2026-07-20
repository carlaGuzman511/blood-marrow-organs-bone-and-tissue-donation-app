import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Donation } from '@/models/App.types';

type Props = {
  item: Donation;
};

export default function HeroCard({ item }: Props) {
  return (
    <View style={styles.container}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.summary}>{item.description}</Text>
      </View>
    </View>
  );
}

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
