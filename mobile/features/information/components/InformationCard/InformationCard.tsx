import React from 'react';
import { TouchableOpacity, ImageBackground, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '@/components/ui/AppText';
import styles from './InformationCard.styles';
import { useRouter } from 'expo-router';
import { Donation } from '@/models/App.types';
import { useTheme } from '@/theme';

type Props = {
  item: Donation;
};

export default function InformationCard({ item }: Props) {
  const router = useRouter();
  const { colors } = useTheme();

  const onPress = () => {
    router.push({
      pathname: '/information/details',
      params: item,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={styles.touchable}
      accessibilityRole="button"
      accessibilityLabel={`Open information about ${item.name}`}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient colors={["transparent", colors.mediaScrim]} style={styles.gradient}>
          <View style={styles.textContainer}>
            <AppText preset="h3" style={styles.title} numberOfLines={2}>
              {item.name}
            </AppText>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}
