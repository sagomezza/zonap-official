import React, { Component } from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import FooterStyles from './styles';

const FooterIndex = ({navigation}) => {
    return (
      <View style={{flexDirection: 'row', position: 'absolute', bottom:0}}>
        <TouchableOpacity style ={FooterStyles.buttonH} onPress={() => navigation.navigate('Home')}>
          <Text style ={FooterStyles.footerText} ></Text>  
        </TouchableOpacity>
        <TouchableOpacity style ={FooterStyles.buttonI} onPress={() => navigation.navigate('UserInput')}>
          <Text style ={FooterStyles.footerText} >Ingresos</Text>  
       </TouchableOpacity>
        <TouchableOpacity style ={FooterStyles.buttonS} onPress={() => navigation.navigate('UserOut')}>
          <Text style ={FooterStyles.footerText} >Salidas</Text>  
        </TouchableOpacity>

      </View>
    );
}

export default FooterIndex;