import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  title: string;
  children?: React.ReactNode;
};

export default function SectionCard({ title, children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  body: {},
});
