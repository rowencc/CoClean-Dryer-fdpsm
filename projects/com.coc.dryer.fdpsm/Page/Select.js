import React from 'react';
import {DeviceEventEmitter, Image, TouchableOpacity} from 'react-native'

import {
    View,
    Text,
} from 'react-native';
import TitleBar from "miot/ui/TitleBar";
import {strings} from "miot/resources";
import {NumberSpinner} from 'miot/ui'
let param = 0;
export default class Selects extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            param:0
        };
    }
    paramNum =(num) => {
        // let num = this.state.param+1;
        this.setState({
            param: num.newValue
        });
        param = num.newValue;
    };
    static navigationOptions = ({ navigation }) => {
        return {
            header:
                <TitleBar
                    type='dark'
                    title='烘干时间表'
                    style={{ backgroundColor: '#fff' }}
                    onPressLeft={_ => {
                        navigation.goBack();
                        DeviceEventEmitter.emit("EventType", param);
                    }}
                />
        };
    };
    render(){
        return (
            <View style={{flex: 1,justifyContent: 'center',alignContent: 'center'}}>
                <NumberSpinner
                    style={{height:300}}
                    maxValue={360}
                    minValue={0}
                    defaultValue={0}
                    unit={''}
                    onNumberChanged={data=>{this.paramNum(data)}}
                />
                <Text style={{textAlign: 'center'}}>有本事你选个数</Text>
            </View>
        )
    }
}

