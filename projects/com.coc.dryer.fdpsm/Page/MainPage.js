import React from 'react';
import { API_LEVEL, Package, Device, Service, Host } from 'miot';
import { PackageEvent, DeviceEvent } from 'miot';
import TitleBar from "miot/ui/TitleBar";
import Setting from "./Setting";
import { Image, ListView, PixelRatio, StyleSheet, Text, TouchableHighlight, View ,Button } from 'react-native';
import { getString } from '../Main/MHLocalizableString';

var Dimensions = require('Dimensions');
var {width,height} = Dimensions.get("screen");//第一种写法
// var height = Host.getPhoneScreenInfo;
export default class App extends React.Component  {
    render() {
        return (
            <View style={style.container}>
                <View style={style.overTimeBox}>
                    <View style={style.overTime}>
                        <Text style={style.overTimeText}>约17:34完成</Text>
                    </View>
                </View>
                <View style={{flex:1,justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 0,
                    marginTop: 40,
                    padding: 0,position:'relative'}}>

                    {/*    时间计时器*/}
                    <View style={style.timeContainer}>
                        <Text style={style.timeLable}>360</Text>
                        <Text style={style.unitLable}>min</Text>
                    </View>
                    <View style={style.timeBeContainer}></View>
                </View>
                <View style={style.rowContainer}>
                    {/*    选择按钮*/}
                    <Text style={style.tabLable} onPress={() => alert('背心')}>背心</Text>
                    <Text style={style.tabLable} onPress={() => alert('短袖')}>短袖</Text>
                    <Text style={style.tabLable} onPress={() => alert('长袖')}>长袖</Text>
                    <Text style={style.tabLable} onPress={() => alert('毛巾')}>毛巾</Text>
                    <Text style={style.tabLable} onPress={() => alert('牛仔裤')}>牛仔裤</Text>
                    <Text style={style.tabLable} onPress={() => alert('薄外套')}>薄外套</Text>
                </View>
                <View style={style.rowContainer}>
                    {/*    功能按键*/}
                    <View style={style.butBox} onPress={() => alert('开关')}>
                        <View style={style.butIcon} onPress={() => alert('开关')}>

                        </View>
                        <Text style={style.butLable} onPress={() => alert('开关')}>开关</Text>
                    </View>
                    <View style={style.butBox} onPress={() => alert('加时')}>
                        <View style={style.butIcon}></View>
                        <Text style={style.butLable}>加时</Text>
                    </View>
                    <View style={style.butBox} onPress={() => alert('减时')}>
                        <View style={style.butIcon}></View>
                        <Text style={style.butLable}>减时</Text>
                    </View>
                </View>
            </View>
        )
    }
}
Package.entry(App, () => {

})

var style = StyleSheet.create({
    navigate: {
        backgroundColor: 'transparent',
    },
    container: {
        width: width,
        height: height-90,
        backgroundColor: '#0e62bd',

    },
    rowContainer: {
        height: 5,
        alignSelf: 'stretch',
        flexDirection: 'row',
        paddingLeft: 23,
        paddingRight: 23,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    timeContainer:{
        position:'absolute',
        borderWidth:10,
        borderColor:'#ccc',
        borderRadius:100,
        width:200,
        height:200,
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeBeContainer:{
        position:'absolute',
        borderWidth:10,
        borderColor:'#fff',
        borderRadius:100,
        width:200,
        height:200
    },
    tabLable:{
        marginLeft: 5,
        marginRight: 5,
        color:'#fff'
    },
    timeLable:{
        marginLeft: 5,
        marginRight: 5,
        color:'#fff',
        lineHeight:48,
        fontSize: 48
    },
    unitLable:{
        marginLeft: 5,
        marginRight: 5,
        color:'#fff',
        lineHeight:32,
        fontSize: 32
    },
    butBox:{
        flex:1,
        alignItems: 'center',
        justifyContent:'center'
    },
    butIcon:{
        height:60,
        width:60,
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:30,
        marginBottom:15
    },
    butLable:{
        marginLeft: 20,
        marginRight: 20,
        fontSize:14,
        color:'#fff'
    },
    list: {
        alignSelf: 'stretch',
    },
    title: {
        fontSize: 15,
        color: '#333333',
        alignItems: 'center',
        flex: 1,
    },
    subArrow: {
        width: 7,
        height: 14,
    },
    text:{
        color:'#fff'
    },
    content:{
        flex: .3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
        marginTop: 0,
        padding: 0
    },
    overTimeBox:{
        flex:.3,
        alignItems:'center',
        justifyContent:'center'
    },
    overTime:{
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:13,
        height:26,
        width:100,
    },
    overTimeText:{
        color:'#fff',
        textAlign: 'center',
        lineHeight:30
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        borderTopColor: '#f1f1f1',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginBottom: 0,
        marginTop: 0,
    },
    rowContainer: {
        height: 52,
        alignSelf: 'stretch',
        flexDirection: 'row',
        paddingLeft: 23,
        paddingRight: 23,
        alignItems: 'center',
        flex: 1,
    },
    list: {
        alignSelf: 'stretch',
    },

    title: {
        fontSize: 15,
        color: '#333333',
        alignItems: 'center',
        flex: 1,
    },
    subArrow: {
        width: 7,
        height: 14,
    },
    separator: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#e5e5e5',
        marginLeft: 20,
    }
});
