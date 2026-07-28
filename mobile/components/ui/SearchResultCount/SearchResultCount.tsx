import React from 'react';
import { Text, View } from 'react-native';
import styles from './SearchResultCount.styles';

type Props = {
  count: number;
  label?: string;
};

export default function SearchResultCount({ count, label = 'results' }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {count} {label}
      </Text>
    </View>
  );
}