import { StyleSheet} from 'react-native'
import { COLORS, SIZES } from '@/constants';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    // backgoundColor: COLORS.gray,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    borderRadius: 12,
    borderColor: COLORS.secondaryGray,
    borderWidth: 1,
    flexDirection: 'row',
    marginVertical: 5,
  },
  input: {
    color: COLORS.secondaryGray,
    flex: 1,
    fontFamily: 'sans-serif-light',
    paddingTop: 0,
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
    color: COLORS.secondaryGray,
  },
  errorContainer: {
    marginVertical: 2,
  },
  errorText:{
    color: "red",
    fontSize: 12,
  }
})

export default styles;