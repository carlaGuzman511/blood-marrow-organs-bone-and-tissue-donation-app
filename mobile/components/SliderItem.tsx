import { View, Text, Image, Dimensions, StyleSheet } from 'react-native'
import React from 'react'
import { COLORS } from '@/constants';
import {LinearGradient} from 'expo-linear-gradient';
import styles from './SliderItem.styles';

type Data = {
  name: string,
  image: any,  
  description: string,
}

type Props = {
    item: Data
}

export default function SliderItem({item}: Props) {
  const {width, height} = Dimensions.get('screen');
  return (
    <View style={styles.container}>
      <Image source={item.image} style={styles.image} />
      <LinearGradient colors={["transparent", COLORS.mediaScrim]} style={styles.gradient}>
        <View style={styles.inner}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description.replace(/\\n/g, '\n')}</Text>
        </View>
      </LinearGradient>
    </View>
  )
}