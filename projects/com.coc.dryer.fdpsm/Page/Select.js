import React from 'react';
import {DeviceEventEmitter, Image, TouchableOpacity} from 'react-native'

import {
    View,
    Text,
} from 'react-native';
import TitleBar from "miot/ui/TitleBar";
import {strings} from "miot/resources";
let param = 0;
export default class Selects extends React.Component{
    constructor(props) {
        super(props);
        this.state = { param:0};
    }
    paramNum =() => {
        let num = this.state.param+1;
        this.setState({
            param: num
        });
        param = num;
    };
    static navigationOptions = ({ navigation }) => {
        return {
            header:
                <TitleBar
                    type='dark'
                    title={strings.setting}
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
                <TouchableOpacity style={{flex: 1,justifyContent: 'center',alignContent: 'center'}} onPress={this.paramNum}>
                    <Text style={{textAlign: 'center',marginBottom: 50}}>{ this.state.param }</Text>
                    <Text style={{textAlign: 'center'}}>有本事你点我</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

