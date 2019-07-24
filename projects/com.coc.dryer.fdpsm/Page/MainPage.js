import React from 'react';
import { API_LEVEL, Package, Device, Service, Host } from 'miot';
import {DeviceEventEmitter} from 'react-native'
import Selects from './Select';
import { AppRegistry,Image, ListView, PixelRatio, StyleSheet, Text, TouchableHighlight, View ,Button,TouchableOpacity } from 'react-native';

let Dimensions = require('Dimensions');
let {width,height} = Dimensions.get("screen");//第一种写法

export default class App extends React.Component  {
    constructor(props) {
        super(props);
        let time = new Date();
        this.state = {
            count: 0,
            time: this.getTodayDate(0),
            param: null
        };

    }
    setNum = (param) =>{
        this.setState({time: this.getTodayDate(param)});
        this.setState({count: this.state.count+param});
    };
    componentDidMount() {
        // 这里的`param`可以为空，接受你B页面传过来的数据
        this.subscription = DeviceEventEmitter.addListener("EventType", (param)=>{
            // 刷新界面等
            // alert(param);
            this.setNum(param);
        });
    }
    componentWillUnmount() {
        this.subscription.remove();
    }
    getTodayDate = (param) => {
        if(param<=0)param=0;
        let paramTime = {
            hours:Math.floor(param/60),
            minute:Math.floor(Math.floor(param%60))
        }
        let date = new Date();
        let year = date.getFullYear().toString();
        let month = (date.getMonth()+1).toString();
        let day = date.getDate().toString();
        // let hour =  date.getHours().toString();
        let hour =  (date.getHours()+paramTime.hours).toString();
        // let minute = date.getMinutes().toString();
        let minute = (date.getMinutes()+paramTime.minute).toString();
        // this.setState({time: hour+':'+minute});
        return hour+':'+minute;
    };

    onPressP = () => {
        if(this.state.count<=355){
            this.setState({
                count: this.state.count+5
            });
        }else{
            this.setState({
                count: 360
            });
        }
    };
    onPressM = () => {
        if(this.state.count>=5){
            this.setState({
                count: this.state.count-5
            });
        }else{
            this.setState({
                count: 0
            });
        }

    };
    render() {
        return (
            <View style={style.container}>
                <View style={style.overTimeBox}>
                    <View style={style.overTime}>
                        <Text style={style.overTimeText}>约{ this.state.time }完成</Text>
                    </View>
                </View>
                <View style={{flex:1,justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 40,
                    marginTop: 0,
                    padding: 0,position:'relative'}}>

                    {/*    时间计时器*/}
                    <View style={style.timeContainer}>
                        <Text style={style.timeLable}>{ this.state.count }</Text>
                        <Text style={style.unitLable}>min</Text>
                    </View>
                    <View style={style.timeBeContainer}></View>
                    <View style={style.timeBeContainer1}></View>
                    <View style={style.timeBeContainer2}></View>
                    <View style={style.timeBeContainer3}></View>
                    <View style={style.timeBeContainer4}></View>
                    <View style={style.timeBeContainer5}></View>
                    <View style={style.timeBeContainer6}></View>
                    <View style={style.timeBeContainer7}></View>
                    <View style={style.timeBeContainer9}></View>
                    <View style={style.timeBeContainer8}></View>
                    <View style={style.timeBeContainer10}></View>
                </View>
                <View style={style.rowContainer}>
                    {/*    选择按钮*/}
                    <Text style={style.tabLable} onPress={() => this.props.navigation.navigate('Selects', { 'title': '烘干时间表' })}>帮我计算干衣时间 ></Text>
                </View>
                <View style={style.rowContainer}>
                    {/*    功能按键*/}
                    <View style={style.butBox}>
                        <TouchableOpacity
                            style={style.butIcon}
                            onPress={() => alert(this.state.count)}
                        >
                            <Image source={require('../Resources/dryer/switch.png')}></Image>
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={() => alert(this.state.count)}>开关</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity
                            style={style.butIcon}
                            onPress={this.onPressM}
                        >
                            <Image source={require('../Resources/dryer/reduce.png')}></Image>
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={this.onPressM}>减时</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity
                            style={style.butIcon}
                            onPress={this.onPressP}
                        >
                            <Image source={require('../Resources/dryer/plus.png')}></Image>
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={this.onPressP}>加时</Text>
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
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1
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
        borderWidth:20,
        borderColor:'#ccc',
        borderRadius:150,
        width:250,
        height:250,
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeBeContainer:{
        position:'absolute',
        borderWidth:20,
        borderColor:'#fff',
        borderRadius:150,
        width:250,
        height:250
    },
    timeBeContainer1:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:273,
        height:273
    },
    timeBeContainer2:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:277,
        height:277
    },
    timeBeContainer3:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:281,
        height:281
    },
    timeBeContainer4:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:285,
        height:285
    },
    timeBeContainer5:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:289,
        height:289
    },
    timeBeContainer6:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:293,
        height:293
    },
    timeBeContainer7:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:297,
        height:297
    },
    timeBeContainer8:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:301,
        height:301
    },
    timeBeContainer9:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:305,
        height:305
    },
    timeBeContainer10:{
        opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:309,
        height:309
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
        lineHeight:68,
        fontSize: 68
    },
    unitLable:{
        marginLeft: 5,
        marginRight: 5,
        color:'#fff',
        lineHeight:42,
        fontSize: 42
    },
    butBox:{
        flex:1,
        alignItems: 'center',
        justifyContent:'center',
        height:60,
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
        flex:1,
        height:26,
        marginTop:40,
        alignItems:'center',
        justifyContent:'flex-start'
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
