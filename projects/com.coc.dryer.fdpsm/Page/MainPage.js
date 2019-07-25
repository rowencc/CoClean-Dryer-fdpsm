import React from 'react';
import { API_LEVEL, Package, Device, Service, Host } from 'miot';
import Selects from './Select';
import { DeviceEventEmitter, Animated, Easing, Image, ListView, PixelRatio, StyleSheet, Text, TouchableHighlight, View ,TouchableOpacity } from 'react-native';
import PercentageCircle from 'react-native-percentage-circle';

let Dimensions = require('Dimensions');
let {width,height} = Dimensions.get("screen");//第一种写法
export default class App extends React.Component  {
    constructor(props) {
        super(props);
        this.state = {
            min: 0, //最小值
            max: 360, //最大值
            count: 0, // 默认时间值
            percents:0, //百分比默认值
            getParam: 0,  //传入值
            step: 5,  //步进
            status: false, //开关状态
            statusText: '开启', //开关文字描述
            statusImg: require('../Resources/dryer/switch.png'), //开关文字描述
            plusText: '加时', //加时文字描述
            plusImg: require('../Resources/dryer/plus.png'), //加时按钮图片
            reduceText: '加时', //减时文字描述
            reduceImg: require('../Resources/dryer/reduce.png'), //减时按钮图片
            time: this.getTodayDate(0), // 获取预计完成时间

            requestStatus: false,
            method: '',
            params: {},
            extra: {},
            paramsString: '',
            extraString: {},
            result: 'None'
        };

    }
    setNum = (param) => {
        this.setState({count: param});
        this.setState({percents: param/this.state.max*100});
        this.setState({time: this.getTodayDate(param)});
    };
    setCountdown = () => {
        this.timer && clearInterval(this.timer);
        if(this.state.count>0){
            this.timer = setInterval(
                () => {
                    let count = this.state.count;
                    this.setState({count: count-1});
                    this.setState({percents: (count-1)/this.state.max*100});
                    if(this.state.count===0){
                        this.timer && clearInterval(this.timer);
                        this.setState({status: false});
                        this.setState({statusText: '开启'});
                        // this.setState({statusImg: require('../Resources/dryer/switch.png')});
                    }
                },
                1000
            )
        }
    };
    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener("EventType", (param)=>{
            // 接收传参并执行写入
            this.setNum(param);
        });
    }
    componentWillUnmount() {
        this.subscription.remove();
    }
    getTodayDate = (param) => {
        // if(param != 0){
        //     params = this.state.getParam;
        // }
        let paramTime = {
            hours:Math.floor(param/60),
            minute:Math.floor(Math.floor(param%60))
        }
        let tomorrow = '';
        let date = new Date();
        let year = date.getFullYear().toString();
        let month = (date.getMonth()+1).toString();
        let day = date.getDate().toString();
        let hourNumber =  date.getHours()+paramTime.hours;
        let minuteNumber = date.getMinutes()+paramTime.minute;
        if(minuteNumber>=60) {
            minuteNumber = minuteNumber%60;
            hourNumber = hourNumber + Math.floor(minuteNumber/60);
        }
        if(hourNumber>=24){
            hourNumber = hourNumber%24;
            if(hourNumber.toString()===1) hourNumber='0'+hourNumber.toString();
            tomorrow = '明天 ';
        }
        let hour =  hourNumber.toString();
        let minute = minuteNumber.toString();
        if(hour.length===1) hour = '0'+hour;
        if(minute.length===1) minute = '0'+minute;
        return tomorrow + hour+':'+minute;
    };
    onPressSwitch = () => {
        if( this.state.count===0 ) {
            alert('请设定烘干时间后 重试');
            return false;
        }
        if(!this.state.status){
            this.setState({status: true});
            this.setState({statusText: '关闭'});
            // this.setState({statusImg: require('../Resources/dryer/switch-1.png')});
            this.setCountdown()
        }else{
            this.timer && clearInterval(this.timer);
            this.setState({status: false});
            this.setState({statusText: '开启'});
            // this.setState({statusImg: require('../Resources/dryer/switch.png')});
        }
    };
    onPressPlus = () => {
        if(this.state.count<=this.state.max-this.state.step){
            this.setNum(this.state.count+this.state.step)
        }else{
            this.setState({
                count: this.state.max
            });
        }
    };
    onPressReduce = () => {
        if(this.state.count>=this.state.min+this.state.step){
            this.setNum(this.state.count-this.state.step)
        }else{
            this.setState({
                count: this.state.min
            });
        }

    };
    onPressShare = () => {
        Host.file.screenShot("temp.png").then((result)=>{ console.log('截屏成功' + result);
        Host.ui.openShareListBar('分享', '分享描述', {local: "temp.png"},'') }).catch((err)=>{ console.log('截屏失败' + err) })
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

                    <PercentageCircle radius={125} percent={ this.state.percents } innerColor={'#0e62bd'} borderWidth={20} bgcolor={'transparent'} color={"#fff"}>
                        <View style={style.timeContainer}>
                            <Text style={style.timeLable}>{ this.state.count }</Text>
                            <Text style={style.unitLable}>min</Text>
                        </View>
                    </PercentageCircle>
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
                        <TouchableOpacity style={style.butIcon} onPress={this.onPressSwitch} >
                            <Image source={ this.state.statusImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={this.onPressSwitch}>{ this.state.statusText }</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity style={style.butIcon} onPress={this.onPressReduce} >
                            <Image source={ this.state.reduceImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={this.onPressReduce}>{ this.state.reduceText }</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity style={style.butIcon} onPress={this.onPressPlus} >
                            <Image source={ this.state.plusImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={this.onPressPlus}>{ this.state.plusText }</Text>
                    </View>
                </View>
            </View>
        )
    }
    sendRequest() {
        var params = this.state.params;
        var method = this.state.method;
        var extra = this.state.extra;
        if (method == '') {
            alert('method 不能为空')
            return;
        }
        console.log('extra', extra)
        Device.getDeviceWifi().callMethod(method, params, extra).then(res => {
            var result = JSON.stringify(res);
            this.setState({ result })
        }).catch(err => {
            console.log('error:', err)
            var result = JSON.stringify(err);
            result = "Error: \n" + result;
            this.setState({ result })
        })
    }

    sendRemoteRequest() {
        var params = this.state.params;
        var method = this.state.method;
        var extra = this.state.extra;
        if (method == '') {
            alert('method 不能为空')
            return;
        }
        Device.getDeviceWifi().callMethodFromCloud(method, params).then(res => {
            var result = JSON.stringify(res);
            this.setState({ result })
        }).catch(err => {
            var result = JSON.stringify(err);
            result = "Error: \n" + result;
            this.setState({ result })
        })
    }

    clearParams() {
        this.setState({ params: {}, extra: {}, paramsString: '', extraString: '', method: '' })
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
        opacity:0.3,
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
        height:273,
        // transform:[{rotate: this.spin }]

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
