import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        flex: 1,
        marginHorizontal: 22,
        paddingTop: 4,
    },
    body: {
        flex: 1,
        marginTop: 20,
    },
});

export default styles;