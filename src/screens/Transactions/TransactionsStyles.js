import { StyleSheet, Dimensions } from 'react-native';
import normalize from '../../config/services/normalizeFontSize';

const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    listContainer: {
        height: '78%',
        width: '73%',
        backgroundColor: '#FFFFFF',
        marginTop: '8%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textListTitle: {
        fontSize: normalize(15),
        color: '#00A9A0',
        fontFamily: 'Montserrat-Bold'
    },
    textPlaca: {
        fontSize: normalize(18),
        color: '#5D5D5D',
        fontFamily: 'Montserrat-Bold'
    },
    textPago: {
        fontSize: normalize(13),
        color: '#5D5D5D',
        fontFamily: 'Montserrat-Regular'
    },
    textMoney: {
        fontSize: normalize(19),
        color: '#5D5D5D',
        fontFamily: 'Montserrat-Regular'
    },
    textListTitle: {
        fontSize: width * 0.025,
        color: '#00A9A0',
        fontFamily: 'Montserrat-Bold'
    },
    textPlaca: {
        fontSize: width * 0.03,
        color: '#5D5D5D',
        fontFamily: 'Montserrat-Bold'
    },
    textPago: {
        fontSize: width * 0.02,
        color: '#5D5D5D',
        fontFamily: 'Montserrat-Regular'
    },
    textMoney: {
        fontSize: width * 0.034,
        color: '#5D5D5D',
        fontFamily: 'Montserrat-Regular'
    },
});

export default styles;