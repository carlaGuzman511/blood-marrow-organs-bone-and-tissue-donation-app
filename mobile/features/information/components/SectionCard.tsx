import React from 'react';
import { View, Text } from 'react-native';
import { useStyles } from './SectionCard.styles';

type Props = {
  title: string;
  children?: React.ReactNode;
};

export default function SectionCard({ title, children }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}