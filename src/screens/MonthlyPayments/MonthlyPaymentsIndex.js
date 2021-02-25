import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, Modal, ImageBackground, Keyboard } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { TextInput } from 'react-native-gesture-handler';
import styles from '../MonthlyPayments/MonthlyPaymentsStyles';

import { FIND_MENSUALITY_PLATE, RENEW_MENSUALITY, EDIT_MENSUALITY, CREATE_USER, CREATE_MENSUALITY, EDIT_USER } from "../../config/api";
import instance from "../../config/axios";
import { TIMEOUT } from '../../config/constants/constants';
import { firestore } from '../../config/firebase'

import { connect } from "react-redux";
import * as actions from "../../redux/actions";
import normalize from '../../config/services/normalizeFontSize';
import moment from 'moment';

import numberWithPoints from '../../config/services/numberWithPoints';
import Header from '../../components/Header/HeaderIndex';
import FooterIndex from '../../components/Footer';
import Button from '../../components/Button';
import DropDownPicker from 'react-native-dropdown-picker';



const MonthlyPayments = (props) => {
    const { navigation, officialProps, reservations, recips, hq } = props;
    const officialHq = officialProps.hq !== undefined ? officialProps.hq[0] : "";
    const [plateOne, setPlateOne] = useState('');
    const [plateTwo, setPlateTwo] = useState('');
    const refPlateOne = useRef(null);
    const refPlateTwo = useRef(null);
    const [loading, setLoading] = useState(false);
    const [mensualityExists, setMensualityExists] = useState();
    const [mensuality, setMensuality] = useState({});
    const [charge, setCharge] = useState(false);
    const mensualityInfo = mensuality.data !== undefined ? mensuality.data[0] : "";
    const mensualityValue = mensualityInfo.value !== undefined ? mensualityInfo.value : 0;
    // Modals
    const [modalVisible, setModalVisible] = useState(false);
    const [modal2Visible, setModal2Visible] = useState(false);
    const [modal3Visible, setModal3Visible] = useState(false);
    const [modal4Visible, setModal4Visible] = useState(false);

    // To modify plates asociated to mensuality
    const [firstPlate, setFirstPlate] = useState('')
    const [secondPlate, setSecondPlate] = useState('')
    const [thirdPlate, setThirdPlate] = useState('')
    const [fourthPlate, setFourthPlate] = useState('')
    const [fifthPlate, setFifthPlate] = useState('')
    // Info for new mensuality
    const [phoneNewMen, setPhoneNewMen] = useState('');
    const [emailNewMen, setEmailNewMen] = useState('');
    const [nameNewMen, setNameNewMen] = useState('');
    const [lastNameNewMen, setLastNameNewMen] = useState('');
    const [userId, setUserId] = useState('');
    const [typeOptions, setTypeOptions] = useState(["personal", "corporate"]);
    const [newMenType, setNewMenType] = useState('');

    const [firstPlateNewMen, setFirstPlateNewMen] = useState('')
    const [secondPlateNewMen, setSecondPlateNewMen] = useState('')
    const [thirdPlateNewMen, setThirdPlateNewMen] = useState('')
    const [fourthPlateNewMen, setFourthPlateNewMen] = useState('')
    const [fifthPlateNewMen, setFifthPlateNewMen] = useState('')

    const firstPlateData = mensualityInfo.plates !== undefined ? mensualityInfo.plates[0] + '' : ''
    const secondPlateData = mensualityInfo.plates !== undefined ? mensualityInfo.plates[1] + '' : ''
    const thirdPlateData = mensualityInfo.plates !== undefined ? mensualityInfo.plates[2] + '' : ''
    const fourthPlateData = mensualityInfo.plates !== undefined ? mensualityInfo.plates[3] + '' : ''
    const fifthPlateData = mensualityInfo.plates !== undefined ? mensualityInfo.plates[4] + '' : ''

    let plates = [firstPlate, secondPlate, thirdPlate, fourthPlate, fifthPlate]
    let newPlates = plates.filter(plate => plate != undefined && plate != '')

    let platesNewMen = [firstPlateNewMen, secondPlateNewMen, thirdPlateNewMen, fourthPlateNewMen, fifthPlateNewMen]
    let platesNewMensuality = platesNewMen.filter(plate => plate != undefined && plate != '')

    const [validityDate, setValidityDate] = useState(new Date(moment(new Date()).add(1, 'months')));
    const [validityDateNewMen, setValidityDateNewMen] = useState(moment(validityDate).set("date", 5));


    const clearPlateOne = () => {
        setPlateOne('');
    }
    const clearPlateTwo = () => {
        setPlateTwo('');
    }
    const clearFirstPlate = () => {
        setFirstPlate('');
    }
    const clearSecondPlate = () => {
        setSecondPlate('');
    }
    const clearThirdPlate = () => {
        setThirdPlate('');
    }
    const clearFourthPlate = () => {
        setFourthPlate('');
    }
    const clearFifthPlate = () => {
        setFifthPlate('');
    }

    const clearNameNewMen = () => {
        setNameNewMen('');
    }
    const clearLastNameNewMen = () => {
        setLastNameNewMen('');
    }
    const clearPhoneNewMen = () => {
        setPhoneNewMen('');
    }
    const clearEmailNewMen = () => {
        setEmailNewMen('');
    }
    const clearFirstPlateNewMen = () => {
        setFirstPlateNewMen('');
    }

    const mensualityCreatedModal = () => {
        setModal4Visible(false);
        setNameNewMen('');
        setLastNameNewMen('');
        setPhoneNewMen('');
        setEmailNewMen('');
        setFirstPlateNewMen('');
    }

    function isCharacterALetter(char) {
        return (/[a-zA-Z]/).test(char)
    }

    const user = () => {
        setLoading(true);
        firestore.collection("users")
            .where('plates', "array-contains", firstPlateNewMen)
            .where('phone', '==', '+57' + phoneNewMen)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    createUser();
                } else {
                    snapshot.forEach(doc => {
                        setUserId(doc.id)
                        editUser(doc.id);
                        createMensuality(doc.id);
                    })


                }
            })
    };

    async function editUser(idUser) {
        setLoading(true);
        console.log("entro en editUser---------------------------")
        try {
            if (firstPlateNewMen.length === 6 && phoneNewMen.length === 10 && userId) {
                const response = await instance.post(
                    EDIT_USER,
                    {
                        id: idUser,
                        name: nameNewMen,
                        lastName: lastNameNewMen,
                        phone: '+57' + phoneNewMen,
                        email: emailNewMen,
                        plate: firstPlateNewMen
                    },
                    { timeout: TIMEOUT }
                )
                console.log("entro en EU---------------------------")
                console.log(response.data)
            }
        } catch (err) {
            console.log(err)
            console.log(err?.response)
            setLoading(false);

        }
    }

    async function createUser() {
        setLoading(true);
        try {
            console.log({
                type: "full",
                email: emailNewMen,
                phone: '+57' + phoneNewMen,
                name: nameNewMen,
                lastName: lastNameNewMen,
                expoToken: "",
                monthlyUser: true,
                plate: firstPlateNewMen,
                hqId: officialHq,
                mensualityType: 'personal',
                validity: validityDateNewMen,
                capacity: 5

            })
            if (firstPlateNewMen.length === 6 && phoneNewMen.length === 10) {
                const response = await instance.post(
                    CREATE_USER,
                    {
                        type: "full",
                        email: emailNewMen,
                        phone: '+57' + phoneNewMen,
                        name: nameNewMen,
                        lastName: lastNameNewMen,
                        expoToken: "",
                        monthlyUser: true,
                        plate: firstPlateNewMen,
                        hqId: officialHq,
                        mensualityType: 'personal',
                        validity: validityDateNewMen,
                        capacity: 5
                    },
                    { timeout: TIMEOUT }
                )
                setModal4Visible(true);
                setModal3Visible(false);
                setLoading(false);
            }

        } catch (err) {
            console.log(err)
            console.log(err?.response)
            setLoading(false);

        }
    }

    async function createMensuality(idUser) {
        setLoading(true);
        try {
            console.log(
                {
                    userId: idUser,
                    capacity: 5,
                    vehicleType: "car",
                    validity: validityDateNewMen,
                    userPhone: phoneNewMen,
                    plates: platesNewMensuality,
                    hqId: officialHq,
                    type: 'personal',
                    monthlyUser: true
                }
            )
            if (firstPlateNewMen.length === 6 && phoneNewMen.length === 10) {
                let type
                if (isCharacterALetter(firstPlateNewMen[5])) type = "bike"
                else type = "car"
                const response = await instance.post(
                    CREATE_MENSUALITY,
                    {
                        userId: idUser,
                        capacity: 5,
                        vehicleType: type,
                        validity: validityDateNewMen,
                        userPhone: phoneNewMen,
                        plates: platesNewMensuality,
                        hqId: officialHq,
                        type: 'personal',
                        monthlyUser: true
                    },
                    { timeout: TIMEOUT }
                )
                setModal4Visible(true);
                setModal3Visible(false);
                setLoading(false);
            }
        } catch (err) {
            console.log(err)
            console.log(err?.response)
            setLoading(false);

        }
    }

    async function findMensualityPlate() {
        try {
            if (plateOne.length === 3 && plateTwo.length === 3) {
                const response = await instance.post(
                    FIND_MENSUALITY_PLATE,
                    {
                        plate: plateOne + plateTwo,
                        type: "full"
                    },
                    { timeout: TIMEOUT }
                )
                setMensualityExists(true);
                setMensuality(response.data)
                setLoading(false);
            }
        } catch (err) {
            console.log(err)
            console.log(err?.response)
            setLoading(false);
            setMensualityExists(false);
        }
    }

    async function editMensuality() {
        try {
            if (plateOne.length === 3 && plateTwo.length === 3) {
                console.log({
                    id: mensualityInfo.id,
                    plates: newPlates
                })
                const response = await instance.post(
                    EDIT_MENSUALITY,
                    {
                        id: mensualityInfo.id,
                        plates: newPlates
                    },
                    { timeout: TIMEOUT }
                )
                setModalVisible(!modalVisible);
                console.log(response.data.data)
            }
        } catch (err) {
            console.log(err)
            console.log(err?.response)
            console.log('dentro')
        }
    }

    async function renewMensuality() {
        try {
            if (plateOne.length === 3 && plateTwo.length === 3) {
                const response = await instance.post(
                    RENEW_MENSUALITY,
                    {
                        plate: plateOne + plateTwo
                    },
                    { timeout: TIMEOUT }
                )
                setCharge(false);
                console.log(response.data.data)
            }
        } catch (err) {
            console.log(err)
            console.log(err?.response)
            console.log('dentroRENEW')
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground
                style={{
                    flex: 1,
                    width: '100%',
                    height: normalize(450),
                    flexDirection: 'column'
                }}
                source={require('../../../assets/images/Home.png')}>
                <Header navigation={navigation} />
                <View style={{ height: normalize(150), alignContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center', height: '35%', width: '60%', marginTop: '2%' }}>
                        <TextInput
                            ref={refPlateOne}
                            placeholder={'EVZ'}
                            placeholderTextColor={'#D9D9D9'}
                            style={styles.plateInput}
                            textAlign='center'
                            maxLength={3}
                            autoCapitalize={"characters"}
                            onChangeText={(text) => {
                                setPlateOne(text);
                                if (refPlateTwo && text.length === 3) {
                                    refPlateTwo.current.focus();
                                }
                                ;
                            }}
                            value={plateOne}
                            onFocus={() => { clearPlateOne(); clearPlateTwo(); }}
                        />
                        <TextInput
                            ref={refPlateTwo}
                            placeholder={'123'}
                            placeholderTextColor={'#D9D9D9'}
                            style={styles.plateInput}
                            textAlign='center'
                            maxLength={3}
                            autoCapitalize={"characters"}
                            keyboardType='default'
                            onFocus={() => { clearPlateTwo(); }}
                            onChangeText={text => {
                                setPlateTwo(text);
                                if (text.length === 3) {
                                    if (plateOne.length === 3) Keyboard.dismiss()
                                };
                            }}
                            value={plateTwo}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center', height: '40%', width: '90%', justifyContent: 'center' }}>
                        <Button onPress={() => {
                            setLoading(true);
                            findMensualityPlate();
                        }}
                            title="B U S C A R"
                            color='#FFF200'
                            style={[plateOne === "" || plateTwo === "" ? styles.buttonIDisabled : styles.buttonI]}
                            textStyle={styles.buttonTextSearch}
                            disabled={plateOne === "" || plateTwo === ""}
                            activityIndicatorStatus={loading}
                        />
                    </View>
                </View>
                <View style={styles.container}>
                    <View style={styles.listContainer}>
                        {mensualityExists ?
                            <View style={{ height: '96%', width: '80%', marginTop: '2%', alignContent: 'center', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ height: '60%', width: '100%', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: "#ffffff", marginBottom: '5%' }}>
                                        <Text style={styles.infoTextTitle}>
                                            Placas asociadas:
                                        </Text>
                                        <View style={{ flexDirection: 'column', width: '40%', justifyContent: 'flex-end', alignItems: 'flex-end' }}>

                                            <Text style={styles.infoText}>
                                                {mensualityInfo.plates !== undefined && mensualityInfo.plates[0] !== undefined ? mensualityInfo.plates[0] + ' ' : ' '}
                                            </Text>
                                            <Text style={styles.infoText}>
                                                {mensualityInfo.plates !== undefined && mensualityInfo.plates[1] !== undefined ? mensualityInfo.plates[1] + ' ' : ' '}
                                            </Text>
                                            <Text style={styles.infoText}>
                                                {mensualityInfo.plates !== undefined && mensualityInfo.plates[2] !== undefined ? mensualityInfo.plates[2] + ' ' : ' '}
                                            </Text>
                                            <Text style={styles.infoText}>
                                                {mensualityInfo.plates !== undefined && mensualityInfo.plates[3] !== undefined ? mensualityInfo.plates[3] + ' ' : ' '}
                                            </Text>
                                            <Text style={styles.infoText}>
                                                {mensualityInfo.plates !== undefined && mensualityInfo.plates[4] !== undefined ? mensualityInfo.plates[4] + ' ' : ' '}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: "#ffffff", marginBottom: '5%' }}>
                                        <Text style={styles.infoTextTitle}>
                                            Placas parqueadas:
                                        </Text>
                                        <Text style={styles.infoText}>
                                            {mensualityInfo.parkedPlates}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: "#ffffff", marginBottom: '5%' }}>
                                        <Text style={styles.infoTextTitle}>
                                            Vigencia:
                                        </Text>
                                        <Text style={styles.infoText}>
                                            {moment(mensualityInfo.validity).format('L')} {moment(mensualityInfo.validity).format('LT')}
                                        </Text>
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        borderBottomWidth: 1,
                                        borderColor: "#ffffff",
                                        marginBottom: '2%'
                                    }}>
                                        <Text style={styles.infoTextTitle}>
                                            Valor:
                                        </Text>
                                        <Text style={styles.infoText}>
                                            {`$${numberWithPoints(mensualityValue)}`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{
                                    height: '18%',
                                    width: '80%',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexDirection: 'column',
                                    marginBottom: '5%'
                                }}>
                                    <Button onPress={() => {
                                        setModal2Visible(true);
                                    }}
                                        title="R E N O V A R"
                                        color='gray'
                                        style={[plateOne === "" || plateTwo === "" ? styles.buttonReDisabled : styles.buttonRe]}
                                        textStyle={styles.buttonTextRenew}
                                        disabled={plateOne === "" || plateTwo === ""}
                                    />
                                    <Button onPress={() => {
                                        setModalVisible(true)
                                        setFirstPlate(firstPlateData + '')
                                        setSecondPlate(secondPlateData + '')
                                        setThirdPlate(thirdPlateData + '')
                                        setFourthPlate(fourthPlateData + '')
                                        setFifthPlate(fifthPlateData + '')
                                    }}
                                        title="E D I T A R"
                                        color='gray'
                                        style={[plateOne === "" || plateTwo === "" ? styles.buttonEdDisabled : styles.buttonEd]}
                                        textStyle={styles.buttonTextRenew}
                                        disabled={plateOne === "" || plateTwo === ""}
                                    />
                                </View>
                            </View>
                            :
                            <View style={{ height: '30%', justifyContent: 'space-between' }}>
                                {mensualityExists === false ?
                                    <Text style={{ fontSize: normalize(20), fontFamily: 'Montserrat-Regular' }}>
                                        No se encuentra mensualidad asociada.
                                     </Text>
                                    :
                                    <Text style={{ fontSize: normalize(20), fontFamily: 'Montserrat-Regular' }}>

                                    </Text>
                                }

                                <Button onPress={() => {
                                    setModal3Visible(true);
                                }}
                                    title="C R E A R"
                                    color='gray'
                                    style={styles.buttonEd}
                                    textStyle={styles.buttonTextRenew}
                                // disabled={!(plateOne.length === 3 && plateTwo.length === 3) || !mensualityExists}
                                />
                            </View>
                        }

                    </View>
                    <View style={{
                        height: '20%',
                        width: '100%',
                        justifyContent: 'flex-end',
                    }}>
                        <FooterIndex navigation={navigation} />
                    </View>
                </View>
            </ImageBackground>
            <Modal
                animationType="fade"
                transparent={true}
                backdropOpacity={0.3}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ height: '100%', width: '100%', justifyContent: 'space-between', padding: '3%' }}>
                            <View style={{ marginBottom: '4%', justifyContent: 'center', height: '10%' }}>
                                <Text style={{ ...styles.modalText, fontSize: normalize(20), color: '#00A9A0' }}>Placas asociadas a mensualidad </Text>
                            </View>
                            <View style={{ justifyContent: 'space-between', height: '69%', width: '100%', flexDirection: 'column', paddingBottom: '10%' }}>
                                <View style={{ flexDirection: "row", justifyContent: 'center' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Placa 1:  </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='numeric'
                                        placeholder=''
                                        textAlign='center'
                                        value={firstPlate !== undefined + '' ? firstPlate : ''}
                                        onChangeText={text => setFirstPlate(text)}
                                        onFocus={() => {
                                            clearFirstPlate('')
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: 'center' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Placa 2:  </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='numeric'
                                        placeholder=''
                                        textAlign='center'
                                        // keyboardType={"numeric"}
                                        value={secondPlate !== undefined + '' ? secondPlate : ''}
                                        onChangeText={text => setSecondPlate(text)}
                                        onFocus={() => {
                                            clearSecondPlate('')
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: 'center' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Placa 3:  </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='numeric'
                                        placeholder=''
                                        textAlign='center'
                                        // keyboardType={"numeric"}
                                        value={thirdPlate !== undefined + '' ? thirdPlate : ''}
                                        onChangeText={text => setThirdPlate(text)}
                                        onFocus={() => {
                                            clearThirdPlate('')
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: 'center' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Placa 4:  </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='numeric'
                                        placeholder=''
                                        textAlign='center'
                                        // keyboardType={"numeric"}
                                        value={fourthPlate !== undefined + '' ? fourthPlate : ''}
                                        onChangeText={text => setFourthPlate(text)}
                                        onFocus={() => {
                                            clearFourthPlate('')
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: 'center' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Placa 5:  </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='numeric'
                                        placeholder=''
                                        textAlign='center'
                                        // keyboardType={"numeric"}
                                        value={fifthPlate !== undefined + '' ? fifthPlate : ''}
                                        onChangeText={text => setFifthPlate(text)}
                                        onFocus={() => {
                                            clearFifthPlate('')
                                        }}
                                    />
                                </View>


                            </View>
                            <View style={{ height: '20%', justifyContent: 'flex-end', flexDirection: 'column', marginTop: '0%' }}>
                                <View style={{ height: '50%', width: '100%', justifyContent: 'flex-end', marginBottom: '1%' }}>
                                    <Button onPress={() => {
                                        user();
                                    }}
                                        title="G U A R D A R"
                                        color="#00A9A0"
                                        style={
                                            styles.modalButton
                                        }
                                        textStyle={{
                                            color: "#FFFFFF",
                                            textAlign: "center",
                                            fontFamily: 'Montserrat-Bold'
                                        }} />
                                </View>
                                <View style={{ height: '50%', width: '100%', justifyContent: 'flex-end', marginTop: '2%', marginBottom: '1%' }}>
                                    <Button onPress={() => {
                                        setModalVisible(!modalVisible);
                                    }}
                                        title="V O L V E R"
                                        color="gray"
                                        style={
                                            styles.modalButton
                                        }
                                        textStyle={{
                                            color: "#FFFFFF",
                                            textAlign: "center",
                                            fontFamily: 'Montserrat-Bold'
                                        }} />
                                </View>
                            </View>

                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                backdropOpacity={0.3}
                visible={modal2Visible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ height: '100%', width: '100%', justifyContent: 'center', padding: '3%' }}>
                            <View style={{ marginTop: '8%', justifyContent: 'center', height: '10%' }}>
                                <Text style={{ ...styles.modalText, fontSize: normalize(30), color: '#00A9A0' }}>Reclame {`$${numberWithPoints(mensualityValue)}`} </Text>
                            </View>
                            <View style={{ justifyContent: 'space-between', height: '30%', width: '100%', flexDirection: 'column', paddingBottom: '6%', alignItems: 'center', alignContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center', height: '30%', width: '60%', justifyContent: 'center', paddingTop: '10%' }}>
                                    <CheckBox
                                        value={charge}
                                        onValueChange={() => setCharge(!charge)}
                                        style={{ alignSelf: 'center' }}
                                        tintColors={{ true: '#00A9A0', false: 'gray' }}
                                    />
                                    <Text style={{ color: '#00A9A0', fontFamily: 'Montserrat-Bold', fontSize: normalize(19), textAlign: 'center' }}>Cobrado</Text>
                                </View>
                            </View>
                            <View style={{ height: '45%', justifyContent: 'space-between', flexDirection: 'column' }}>
                                <View style={{ height: '25%', width: '100%', justifyContent: 'flex-end', marginBottom: '3%' }}>
                                    <Button onPress={() => {
                                        renewMensuality()
                                        setModal2Visible(!modal2Visible);
                                    }}
                                        title="R E N O V A R"
                                        color="#00A9A0"
                                        style={charge === false ? styles.modalButtonDisabled : styles.modalButton}
                                        textStyle={{
                                            color: "#FFFFFF",
                                            textAlign: "center",
                                            fontFamily: 'Montserrat-Bold'
                                        }}
                                        disabled={charge === false}
                                    />

                                </View>
                                <View style={{ height: '25%', width: '100%', justifyContent: 'flex-end', marginTop: '2%' }}>
                                    <Button onPress={() => {
                                        setModal2Visible(!modal2Visible);
                                    }}
                                        title="V O L V E R"
                                        color="gray"
                                        style={
                                            styles.modalButton
                                        }
                                        textStyle={{
                                            color: "#FFFFFF",
                                            textAlign: "center",
                                            fontFamily: 'Montserrat-Bold'
                                        }} />
                                </View>
                            </View>

                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                backdropOpacity={0.3}
                visible={modal3Visible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalViewNewMensuality}>
                        <View style={{ height: '100%', width: '100%', justifyContent: 'space-between', padding: '3%' }}>
                            <View style={{ marginBottom: '0%', justifyContent: 'center', height: '10%' }}>
                                <Text style={{ ...styles.modalText, fontSize: normalize(20), color: '#00A9A0' }}> Ingrese la siguiente información: </Text>
                            </View>
                            <View style={{ justifyContent: 'space-between', height: '50%', width: '100%', flexDirection: 'column', paddingBottom: '8%' }}>
                                <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: '1%' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Nombre: </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='default'
                                        placeholder=''
                                        textAlign='center'
                                        value={nameNewMen}
                                        onChangeText={text => setNameNewMen(text)}
                                        onFocus={() => {
                                            clearNameNewMen('')
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: '1%' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Apellido: </Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='default'
                                        placeholder=''
                                        textAlign='center'
                                        value={lastNameNewMen}
                                        onChangeText={text => setLastNameNewMen(text)}
                                        onFocus={() => {
                                            clearLastNameNewMen('')
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: '1%' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Celular:</Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='numeric'
                                        placeholder=''
                                        textAlign='center'
                                        maxLength={10}
                                        value={phoneNewMen}
                                        onChangeText={text => setPhoneNewMen(text)}
                                        onFocus={() => {
                                            clearPhoneNewMen('')
                                        }}
                                    />
                                </View>

                                <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: '1%' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Correo:</Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='default'
                                        placeholder=''
                                        textAlign='center'
                                        value={emailNewMen}
                                        onChangeText={text => setEmailNewMen(text)}
                                        onFocus={() => {
                                            clearEmailNewMen('')
                                        }}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: '1%' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Placa:</Text>
                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#00A9A0',
                                            fontSize: normalize(20),
                                            fontFamily: 'Montserrat-Bold',
                                            width: '60%',
                                            borderRadius: 10,
                                            color: '#00A9A0'
                                        }}
                                        keyboardType='default'
                                        placeholder=''
                                        textAlign='center'
                                        keyboardType={"default"}
                                        autoCapitalize={"characters"}
                                        value={firstPlateNewMen}
                                        onChangeText={text => setFirstPlateNewMen(text)}
                                        onFocus={() => {
                                            clearFirstPlateNewMen('')
                                        }}
                                    />
                                </View>
                                {/* <View style={{ flexDirection: "row", justifyContent: 'space-between', borderWidth: 1, height: '20%' }}>
                                    <Text style={{ ...styles.modalText, fontSize: normalize(20) }}>Placa 5:  </Text>
                                    <DropDownPicker
                                        items={typeOptions}
                                        zIndex={30}
                                        // disabled={!showDropdown}
                                        placeholder={"Selecciona un numero"}
                                        placeholderStyle={{ color: '#8F8F8F', fontSize: normalize(15), textAlign: 'center', fontFamily: 'Montserrat-Bold' }}
                                        selectedLabelStyle={{ color: '#8F8F8F', fontSize: normalize(15), textAlign: 'center', fontFamily: 'Montserrat-Bold' }}
                                        containerStyle={{
                                            height: '100%', width: '60%'
                                        }}
                                        style={{
                                            backgroundColor: '#fafafa',
                                            borderTopLeftRadius: 20,
                                            borderTopRightRadius: 20,
                                            borderBottomLeftRadius: 20,
                                            borderBottomRightRadius: 20

                                        }}
                                        labelStyle={{
                                            justifyContent: 'center', fontFamily: 'Montserrat-Bold', fontSize: normalize(20), color: '#D9D9D9'
                                        }}
                                        dropDownMaxHeight={100}
                                        dropDownStyle={{
                                            backgroundColor: '#fafafa', borderBottomLeftRadius: 15,
                                            borderBottomRightRadius: 15
                                        }}
                                        arrowColor={'#00A9A0'}
                                        arrowStyle={{ alignItems: 'flex-start', alignContent: 'flex-start', justifyContent: 'flex-start' }}
                                        arrowSize={24}
                                        onChangeItem={item => {
                                            setNewMenType(item)
                                        }
                                        }
                                    />
                                </View> */}
                            </View>
                            <View style={{ height: '20%', justifyContent: 'space-between', flexDirection: 'column', marginTop: '3%' }}>
                                <View style={{ height: '50%', width: '100%', justifyContent: 'flex-end' }}>
                                    <Button onPress={() => {
                                        user();
                                    }}
                                        title="G U A R D A R"
                                        color="#00A9A0"
                                        style={
                                            styles.modalButton
                                        }
                                        textStyle={{
                                            color: "#FFFFFF",
                                            textAlign: "center",
                                            fontFamily: 'Montserrat-Bold'
                                        }}
                                        activityIndicatorStatus={loading}
                                    />
                                </View>
                                <View style={{ height: '50%', width: '100%', justifyContent: 'flex-end' }}>
                                    <Button onPress={() => {
                                        setModal3Visible(false);
                                    }}
                                        title="V O L V E R"
                                        color="gray"
                                        style={
                                            styles.modalButton
                                        }
                                        textStyle={{
                                            color: "#FFFFFF",
                                            textAlign: "center",
                                            fontFamily: 'Montserrat-Bold'
                                        }} />
                                </View>
                            </View>

                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                transparent={true}
                backdropOpacity={0.3}
                visible={modal4Visible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ height: '100%', width: '100%', justifyContent: 'space-between', padding: '5%' }}>
                            <View style={{ justifyContent: 'center', height: '30%' }}>
                                <Text style={{ ...styles.modalText, fontSize: normalize(20), color: '#00A9A0' }}> La mensualidad fue creada con éxito.</Text>
                            </View>

                            <View style={{ height: '30%', justifyContent: 'flex-end', flexDirection: 'column', marginTop: '3%' }}>
                                <View style={{ height: '55%', width: '100%', justifyContent: 'flex-end' }}>
                                    <Button onPress={() => {
                                        mensualityCreatedModal();
                                    }}
                                        title="E N T E N D I D O"
                                        color="#00A9A0"
                                        style={
                                            styles.modalButton
                                        }
                                        textStyle={{
                                            color: "#FFFFFF",
                                            textAlign: "center",
                                            fontFamily: 'Montserrat-Bold'
                                        }}
                                        activityIndicatorStatus={loading}
                                    />
                                </View>
                            </View>

                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
};

const mapStateToProps = (state) => ({
    officialProps: state.official,
    reservations: state.reservations,
    recips: state.recips,
    hq: state.hq,
    expoToken: state.expoToken
});

export default connect(mapStateToProps, actions)(MonthlyPayments);
