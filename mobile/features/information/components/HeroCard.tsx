import React from 'react';
import { View, Text, Image } from 'react-native';
import { Donation } from '@/models/App.types';
import styles from './HeroCard.styles';

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