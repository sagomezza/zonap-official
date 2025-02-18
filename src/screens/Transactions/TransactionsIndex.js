import React, { useCallback } from 'react';
import { ImageBackground } from 'react-native';
import {
    Text,
    View,
    FlatList,
    Image,
} from 'react-native';
import Header from '../../components/Header/HeaderIndex';
import numberWithPoints from '../../config/services/numberWithPoints';
import styles from '../Transactions/TransactionsStyles';
import FooterIndex from '../../components/Footer';
import moment from 'moment';
import secondsToString from '../../config/services/secondsToString';
// redux
import { connect } from "react-redux";
import * as actions from "../../redux/actions";

const Transactions = (props) => {
    const { navigation, recips } = props;

    const formatDateDays = (date) => {
        return moment(date).format('L')
    }
    const formatDateHours = (date) => {
        return moment(date).format('LT')
    }

    const recipKeyExtractor = useCallback((item, index) => String(index), [recips.recips]);

    const renderRecipItem = useCallback(({ item, index }) =>
        <View style={{ ...styles.list, paddingTop: '3%', paddingBottom: '4%' }} >
            <Text style={styles.textPlaca}>
                {typeof item.plate === 'string' ? item.plate : item.plate[0]}
            </Text>
            <Text style={styles.dateDaysText}>
                {item.prepayFullDay === true ? `${formatDateDays(item.dateFactured)}` : ""}
                {item.mensuality === true ? `${formatDateDays(item.dateStart)}` : ""}
                {item.isParanoic === true ? `${formatDateDays(item.dateFinished)}` : ""}
                {!item.prepayFullDay && !item.mensuality && !item.isParanoic ? `${formatDateDays(item.dateFinished)}` : ""}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', width: '30%', height: '100%' }}>
                <Text style={styles.dateDaysText}>
                    {item.prepayFullDay === true ? `${formatDateHours(item.dateFactured)}` : ""}
                    {item.mensuality === true ? `${formatDateHours(item.dateStart)}` : ""}
                    {item.isParanoic === true ? `${formatDateHours(item.dateStart)}` : ""}
                    {!item.prepayFullDay && !item.mensuality && !item.isParanoic ? `${formatDateHours(item.dateStart)}` : ""}
                </Text>
                <Image
                    style={{ width: '20%' }}
                    resizeMode={"contain"}
                    source={require('../../../assets/images/arrow.png')} />
                <Text style={styles.dateDaysText}>
                    {item.prepayFullDay === true ? `${formatDateHours(item.dateFinished)}` : ""}
                    {item.mensuality === true ? `${formatDateHours(item.dateFinished)}` : ""}
                    {item.isParanoic === true ? `${formatDateHours(item.dateFinished)}` : ""}
                    {!item.prepayFullDay && !item.mensuality && !item.isParanoic ? `${formatDateHours(item.dateFinished)}` : ""}
                </Text>
            </View>

            <Text style={styles.totalHours}>
                {item.prepayFullDay === true ? " Pase día" : ""}
                {item.mensuality === true ? " Mensualidad" : ""}
                {item.isParanoic === true ? `${secondsToString((item.hours) * 3600)} ` : ""}
                {!item.prepayFullDay && !item.mensuality && !item.isParanoic && item.hours ? `${secondsToString((item.hours) * 3600)} ` : ""}
                {!item.prepayFullDay && !item.mensuality && !item.isParanoic && !item.hours ? 'Pago deuda' : ""}
            </Text>

            <Text style={styles.textPlaca}>
                {item.cash === 0 && item.change === 0 ? '$0' : ''}
                {item.cash >= 0 && item.change < 0 ? `$${numberWithPoints(item.cash)}` : ''}
                {item.cash > 0 && item.change >= 0 ? `$${numberWithPoints(item.total)}` : ''}
            </Text>
        </View>
        , [recips.recips]);

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground
                style={{
                    flex: 1,
                    width: '100%',
                    height: '40%',
                    flexDirection: 'column'
                }}
                source={require('../../../assets/images/logoutStripes.png')}>
                <Header navigation={navigation} />
                <View style={styles.container}>
                    <View style={{ marginTop: '8%' }}>
                        <Text style={styles.textListTitle} >TRANSACCIONES</Text>
                    </View>
                    <View style={{ height: "71%", marginTop: '8%' }}>
                        <View style={{ width: '96%', height: '5%', flexDirection: 'row' }}>
                            <Text style={{ ...styles.titleText, marginLeft: '3%' }}>Placa</Text>
                            <Text style={{ ...styles.titleText, marginLeft: '6%' }}>Fecha</Text>
                            <Text style={{ ...styles.titleText, marginLeft: '13%' }}>Tiempo</Text>
                            <Text style={{ ...styles.titleText, marginLeft: '10%' }}>Total horas</Text>
                            <Text style={{ ...styles.titleText, marginLeft: '6%' }}>Total</Text>
                        </View>
                        {recips.recips.length > 0 ?
                            <FlatList
                                style={{ height: "37%" }}
                                data={recips.recips}
                                keyExtractor={recipKeyExtractor}
                                renderItem={renderRecipItem}
                                maxToRenderPerBatch={7}
                            />
                            :
                            <View style={{ marginLeft: '13%', padding: '10%' }}>
                                <Text style={styles.textPago}> No se encuentran registros en el historial </Text>
                            </View>
                        }
                    </View>
                </View>
            </ImageBackground>
            <View style={{
                height: '10%',
                width: '100%',
                justifyContent: 'flex-end'
            }}>
                <FooterIndex navigation={navigation} />
            </View>

        </View>
    )
};

const mapStateToProps = (state) => ({
    recips: state.recips,
});

export default connect(mapStateToProps, actions)(Transactions);
