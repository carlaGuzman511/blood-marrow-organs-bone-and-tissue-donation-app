import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import styles from './SearchLayout.styles';

type Props = PropsWithChildren<{
    title: string;
    onBack: () => void;
}>;

export default function SearchLayout({
    title,
    onBack,
    children,
}: Props) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Header
                    name={title}
                    onPress={onBack}
                />

                <View style={styles.body}>
                    {children}
                </View>
            </View>
        </SafeAreaView>
    );
}