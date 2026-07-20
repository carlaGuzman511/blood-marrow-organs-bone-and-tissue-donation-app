import { View, Text } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler'
import { COLORS } from '@/constants';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './Input.styles';

type Props = {
    id: string,
    icon?: any | undefined,
    iconPack: any,
    placeholder: string,
    onChangeText?: (text: string) => void,
    value?: string,
    errorText?: string[],
    keyboardType?: string,
    autocapitalize?: string,
    secureTextEntry?: boolean,
}

export default function Input(props: Props) {
  return (
    <View
        style={{
            ...styles.container,
        }}
    >
        <View
            style={{
                ...styles.inputContainer,
            }}
        >
            {
                props.icon && 
                (<MaterialIcons
                    name={props.icon}
                    size={24}
                    style={styles.icon}
                />)
            }
            <TextInput
                style={styles.input}
                placeholder={props.placeholder}
                onChangeText={props.onChangeText}
                value={props.value}
                placeholderTextColor={COLORS.secondaryBlack}
            >
                {
                    props.errorText && 
                    (
                    <View
                        style={{
                            ...styles.errorContainer,
                        }}
                    >
                        <Text
                            style={{
                                ...styles.errorText,
                            }}
                        >
                            {props.errorText[0]}
                        </Text>
                    </View>)
                }
            </TextInput>
        </View>
    </View>
  )
}
