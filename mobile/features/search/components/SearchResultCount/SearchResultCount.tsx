import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONTS } from '@/constants';

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

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  text: {
    color: COLORS.black,
    fontSize: 13,
    fontFamily: FONTS.body4.fontFamily,
  },
});
