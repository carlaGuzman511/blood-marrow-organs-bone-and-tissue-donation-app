import { StyleSheet } from 'react-native'
import { SIZES, COLORS, FONTS } from '@/constants'

const styles = StyleSheet.create({
    btn: {
        paddingHorizontal: SIZES.padding,
        paddingVertical: SIZES.padding2,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.padding,
        color: COLORS.white,
        borderColor: COLORS.green,
        borderWidth: 2,
    }
})

export default styles;