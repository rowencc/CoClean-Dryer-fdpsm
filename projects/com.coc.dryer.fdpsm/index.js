    import React from 'react';
    import { API_LEVEL, Package, Device, Service, Host } from 'miot';
    import { PackageEvent, DeviceEvent } from 'miot';
    import TitleBar from "miot/ui/TitleBar";
    import { Image, ListView, PixelRatio, StyleSheet, Text, TouchableHighlight, View ,Button } from 'react-native';
    import { getString } from './Main/MHLocalizableString';

    var Dimensions = require('Dimensions');
    var {width,height} = Dimensions.get("window");//第一种写法

    class App extends React.Component {
        render() {
            return (
            <View style={style.container}>
                <TitleBar
                    // type='dark'
                    title={Device.name}
                    subTitle=''
                    backgroundColor='blue'
                    style={ style.navigate }
                    onPressLeft={() => { Package.exit() }}
                    onPressRight={() => {
                        navigation.navigate('Setting', { 'title': '设置' });
                    }}
                    onPressRight2={() => alert('onPressRight2')}
                />
                {/*<View style={style.content}>*/}
                {/*    <Text style={style.text}>hello, this is a tiny plugin project of MIOT</Text>*/}
                {/*    <Text style={style.text}>API_LEVEL:{API_LEVEL}</Text>*/}
                {/*    <Text style={style.text}>NATIVE_API_LEVEL:{Host.apiLevel}</Text>*/}
                {/*    <Text style={style.text}>{Package.packageName}</Text>*/}
                {/*    <Text style={style.text}>models:{Package.models}</Text>*/}
                {/*    <Text style={style.text}>Device:{Device.name}</Text>*/}
                {/*</View>*/}
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
                        <View style={style.butIcon}></View>
                        <Text style={style.butLable}>开关</Text>
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
            height: height,
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
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 0,
            marginTop: 0,
            padding: 0
        }
    })