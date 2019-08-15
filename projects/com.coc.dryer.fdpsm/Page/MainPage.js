import React from 'react';
import { API_LEVEL, Package, Device, Service, Host, PackageEvent,ISpecProperty } from 'miot';
import Selects from './Select';
import { DeviceEventEmitter, NativeModules, Animated, Easing, Image, ListView, PixelRatio, StyleSheet, Text, View ,TouchableOpacity, Platform } from 'react-native';
// import ProgressCircle from '../CommonModules/progress-circle';
import * as Progress from 'react-native-progress';

let Dimensions = require('Dimensions');
let {width,height} = Dimensions.get("screen");//第一种写法
const { UIManager } = NativeModules;

export default class App extends React.Component  {
    constructor(props) {
        super(props);
        this.state = {
            min: 0, //最小值
            max: 360, //最大值
            count: 0, // 初始时间值
            defaultNum: 120,//默认开机时间
            percents:0, //百分比默认值
            getParam: 0,  //传入值
            step: 30,  //步进
            status: false, //开关状态
            statusText: '开机', //开关文字描述
            onText: '开机', //关机文字描述
            offText: '关机', //开机文字描述
            statusImg: require('../Resources/dryer/switch.png'), //开关文字描述
            plusText: '加时', //加时文字描述
            plusImg: require('../Resources/dryer/plus.png'), //加时按钮图片
            reduceText: '加时', //减时文字描述
            reduceImg: require('../Resources/dryer/reduce.png'), //减时按钮图片
            overTimeText: '待开机',
            time: this.setTime(0), // 获取预计完成时间
            o: 0,//动画光环隐显  关闭状态下 隐藏，开启状态下  显示
            scaleValue : new Animated.Value(0),
            aniStatus:false,//动画锁
            circleSize:250,

            siid:3,
            piid:0,// 1:left-time, 2:error-code, 3:power, 4:mode, 5:end-status
            aiid:0,// 1:set-time, 2:set-power, 3:set-mode
            eiid:0,// 1:end-send, 2:button-pressed, 3:error-send

            requestStatus: false,
            did: Device.getDeviceWifi().deviceID,
            method: 'get_properties',
            params: [{'value':'on'}],
            extra: {},
            paramsString: '',
            extraString: {},
            result: 'None',
        };
        // this.setAnimation = this.setAnimation.bind(this);
    }
    anim = () =>{
        return Animated.timing(
            this.state.scaleValue,
            {
                toValue: 100,
                duration: 2000,
                friction: 100,
                easing: Easing.linear,
                useNativeDriver: true
            }
        )
    };
    setNum = (param) => {
        if(typeof param!= "number"){
            console.log('参数值类型错误');
            return false
        }
        this.setState({
            count: param,
            percents: param/this.state.max*100,
            time: this.setTime(param),
            o: this.state.status && param>0?1:0,
        });
    };
    setCountdown = (number) => {
        this.timer && clearInterval(this.timer);
        if(this.state.count>0){
            let param = number || this.state.count;
            this.setNum(param);
            if(this.state.status){
                this.setState({statusText: this.state.offText});
                Animated.loop(this.anim()).start();
            } //动画开始
            this.timer = setInterval(
                () => {
                    let count = this.state.count;
                    this.setState({
                        count: count-1,
                        percents: (count-1)/this.state.max*100,
                    });
                    if(this.state.count<=0){
                        this.timer && clearInterval(this.timer);
                        Animated.loop(this.anim()).stop();//动画停止
                        this.setNum(0);
                        this.setState({
                            status: false,
                            statusText: this.state.onText,
                            o: 0,
                            scaleValue : new Animated.Value(0)
                            // statusImg: require('../Resources/dryer/switch.png')
                        });
                    }
                },
                1000
            );

        }else{
            this.timer && clearInterval(this.timer);
            Animated.loop(this.anim()).stop();//动画停止
            this.setNum(0);
            this.setState({
                status: false,
                statusText: this.state.onText,
                o: 0,
                scaleValue : new Animated.Value(0)
            });
        }
    };
    setRun=(count)=>{
        this._sendRequests('setPower',this.state.status?'off':'on');
    };
    setPlusNum=(num)=>{
        if(this.state.count<=this.state.max-this.state.step){
            this._sendRequests('setLeftTime',this.state.count+this.state.step);
        }else{
            this.setState({
                count: this.state.max
            });
        }
    };
    setReduceNum=(num)=>{

    };
    getRequest =(status)=>{
        const method = 'get_properties';
        //获取属性值
        let params = [
            {"did":this.state.did,"piid":1,"siid":3},
            {"did":this.state.did,"piid":2,"siid":3},
            {"did":this.state.did,"piid":3,"siid":3},
            {"did":this.state.did,"piid":4,"siid":3},
            {"did":this.state.did,"piid":5,"siid":3}
        ];
        let paramsString = JSON.stringify(params);
        Device.getDeviceWifi().callMethod(method,paramsString).then(res => {
            let result = JSON.stringify(res);
            let arrys = JSON.parse(result);
            this.setState({
                status: arrys.result[0].value>0 ? true:false,
                result
            });
            this.setNum(arrys.result[0].value);
            setTimeout(()=>{
                this.setCountdown(this.state.count);
            },10);
            console.log('成功 '+':'+this.state.result);
        }).catch(err => {
            console.log('error:', err);
            let result = JSON.stringify(err);
            result = "Error: \n" + result;
            this.setState({ result });
            console.log('失败 '+result)
        })
    };
    async _sendRequests(type,value) {
        /*
        * 功能定义ID
        * siid = 3 当前使用
        * ----------------------------------------------
        * 属性
        * piid = 1 属性名：left-time       衣物烘干剩余时间
        * piid = 2 属性名：error-code      故障通知码
        * piid = 3 属性名：power           电源开关
        * piid = 4 属性名：mode            工作模式
        * piid = 5 属性名：end-status      运行结束状态
        * ----------------------------------------------
        * 方法
        * aiid = 1 方法名：set-time        运行结束通知
        * aiid = 2 方法名：set-power       设置成功通知
        * aiid = 3 方法名：set-mode        异常错误通知
        * ----------------------------------------------
        * 事件
        * eiid = 1 事件名：end-send        运行结束通知
        * eiid = 2 事件名：button-pressed  设置成功通知
        * eiid = 3 事件名：error-send      异常错误通知
        * */
        const did = Device.deviceID;

        let setLeftTime = { did, siid: 3, piid: 1, value: value };
        let setMode = { did, siid: 3, piid: 2, value: value };
        let setPower = { did, siid: 3, piid: 3, value: value };

        let getLeftTime = { did, siid: 3, piid: 1};
        let getErrorCode = { did, siid: 3, piid: 2};
        let getPower = { did, siid: 3, piid: 3};
        let getMode = { did, siid: 3, piid: 4};
        let getEndStatus = { did, siid: 3, piid: 5};
        // let getAll = [getLeftTime,getErrorCode,getPower,getMode,getEndStatus];

        switch (type) {
            case 'setLeftTime':
                this.on = !this.on;
                Service.spec.setPropertiesValue([setLeftTime]).then(res => {
                    this.setNum(value);
                    if(value>0){
                        setTimeout(()=>{
                            this.setCountdown(value);
                        },100);
                    }
                    console.log('setPropertiesValue', res)
                }).catch(res => {
                    console.log(res, 'catch')
                });
                break;
            case 'setPower':
                this.on = !this.on;
                Service.spec.setPropertiesValue([setPower]).then(res => {
                    this.setNum(120);
                    console.log('setPropertiesValue', res)
                }).catch(res => {
                    console.log(res, 'catch')
                });
                break;
            case 'setMode':
                this.on = !this.on;
                Service.spec.setPropertiesValue([setMode]).then(res => {
                    // this.setState({
                    //     status: !status
                    // });
                    console.log('setPropertiesValue', res)
                }).catch(res => {
                    console.log(res, 'catch')
                });
                break;
            case 'get':
                Service.spec.getPropertiesValue([getLeftTime,getErrorCode,getPower,getMode,getEndStatus]).then(res => {
                    console.log('getPropertiesValue', res)
                }).catch(res => {
                    console.log(res, 'catch')
                });
                break;
            case 'do':
                Service.spec.doAction({ did, siid: 3, aiid: 1, inList: [10] }).then(res => {
                    console.log('doAction', res)
                }).catch(res => {
                    console.log(res, 'catch')
                });
                break;
            case 'sub':
                Device.getDeviceWifi().subscribeMessages("end-send", "button-pressed", "error-send").then(res => {
                    console.log('subscribeMessages', res)
                }).catch(res => {
                    console.log(res, 'catch')
                });
                break;
            case 'getSpec':
                Service.spec.getSpecString(did).then(res => {
                    console.log('getSpecString', JSON.stringify(res));
                }).catch(res => {
                    console.log(res, 'catch');
                });
                break;
            case 'getCurrent':
                console.log('执行到这了');
                let data = await Service.spec.getCurrentSpecValue(Device.deviceID);
                console.log(data);
                this.setState({
                    data: data,
                });
                break;
            default:
                break;

        }
    }
    sendRequest =(status,num)=> {
        const method = 'set_properties';
        //提交数据 设置属性值

        /*
        * 功能定义ID
        * siid = 3 当前使用
        * ----------------------------------------------
        * 属性
        * piid = 1 属性名：left-time       衣物烘干剩余时间
        * piid = 2 属性名：error-code      故障通知码
        * piid = 3 属性名：power           电源开关
        * piid = 4 属性名：mode            工作模式
        * piid = 5 属性名：end-status      运行结束状态
        * ----------------------------------------------
        * 方法
        * aiid = 1 方法名：set-time        运行结束通知
        * aiid = 2 方法名：set-power       设置成功通知
        * aiid = 3 方法名：set-mode        异常错误通知
        * ----------------------------------------------
        * 事件
        * eiid = 1 事件名：end-send        运行结束通知
        * eiid = 2 事件名：button-pressed  设置成功通知
        * eiid = 3 事件名：error-send      异常错误通知
        * */

        let params = [{"did":this.state.did,"piid":3,"siid":3,"value": status===true?"off":'on'}];
        let paramsString = JSON.stringify(params);
        Device.getDeviceWifi().callMethod(method,paramsString).then(res => {
            let result = JSON.stringify(res);
            this.setNum(num);
            this.setState({
                status: status===true ? false : true,
                statusText: this.state.onText,
            });
            setTimeout(()=>{
                this.setCountdown(this.state.count);
            },10);
            console.log('成功 '+result);
        }).catch(err => {
            console.log('error:', err);
            let result = JSON.stringify(err);
            result = "Error: \n" + result;
            this.setState({ result });
            console.log('失败 '+result)
        })
    };
    sendLiftTime=(value)=>{
        let params = [{"did":this.state.did,"piid":1,"siid":3,"value": Number(value)}];
        let paramsString = JSON.stringify(params);
        Device.getDeviceWifi().callMethod('set_properties',paramsString).then(res => {
            let result = JSON.stringify(res);
            this.setNum(value);
            // this.setState({
            //     status: status===true ? false : true,
            //     statusText: this.state.onText,
            // });
            setTimeout(()=>{
                this.setCountdown(this.state.count);
            },10);
            console.log('成功 '+result);
        }).catch(err => {
            console.log('error:', err);
            let result = JSON.stringify(err);
            result = "Error: \n" + result;
            this.setState({ result });
            console.log('失败 '+result)
        })
    };
    componentDidMount() {
        PackageEvent.packageWillPause.addListener(()=>{
            console.log('我离开了')
        });
        PackageEvent.packageDidResume.addListener(()=>{
            console.log('我又回来了');
            this.getRequest()
        });
        // this.sendRequests('setLeftTime',60);
        //获取设备状态-
        this.subscription = DeviceEventEmitter.addListener("EventType", (param)=>{
            // 接收传参并执行写入
            this.setNum(param);
            if(param>0){
                setTimeout(()=>{
                    this.setCountdown(this.state.count);
                },100);
            }
        });

    }
    componentWillUnmount() {
        this.subscription.remove();
    }
    setTime = (param) => {
        // if(param != 0){
        //     params = this.state.getParam;
        // }
        let paramTime = {
            hours:Math.floor(param/60),
            minute:Math.floor(Math.floor(param%60))
        };
        let tomorrow = '';
        let date = new Date();
        let year = date.getFullYear().toString();
        let month = (date.getMonth()+1).toString();
        let day = date.getDate().toString();
        let hourNumber =  date.getHours()+paramTime.hours;
        let minuteNumber = date.getMinutes()+paramTime.minute;
        if(minuteNumber>0) {
            hourNumber = hourNumber + Math.floor(minuteNumber/60);
            minuteNumber = minuteNumber%60;
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
        return hour+':'+minute;
    };
    onPressSwitch = () => {
        let num = 0;
        this.state.count===0 ? num = this.state.defaultNum : num = this.state.count;
        if(!this.state.status){
            // this._sendRequest('setLeftTime',num);
            this.sendRequest(this.state.status,num);
        }else{
            this.timer && clearInterval(this.timer);
            this.sendRequest(this.state.status,0);
        }
    };
    onPressPlus = () => {
        if(this.state.count<=this.state.max-this.state.step){
            this.sendLiftTime(this.state.count+this.state.step);
        }else{
            this.setState({
                count: this.state.max
            });
        }
        if(this.state.count+this.state.step>0){
            setTimeout(()=>{
                this.setCountdown(this.state.count);
            },100);
        }
    };
    onPressReduce = () => {
        if(this.state.count>=this.state.min+this.state.step){
            this.sendLiftTime(this.state.count-this.state.step)
        }else{
            this.setState({
                count: this.state.min
            });
        }
        if(this.state.count>0){
            setTimeout(()=>{
                this.setCountdown(this.state.count);
            },50);
        }
    };
    render() {
        const scale = this.state.scaleValue.interpolate({
                inputRange: [0,50,100],
                outputRange: [0.88,1,0.88]
            });
        return (
            <View style={style.container}>
                <View style={style.overTimeBox}>
                    <View style={style.overTime}>
                        <Text style={style.overTimeText}>{ this.state.count <= 0 ?this.state.overTimeText : '约'+this.state.time+'完成'}</Text>
                    </View>
                </View>
                <View style={{flex:1,justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 40,
                    marginTop: -20,
                    padding: 0,position:'relative'}}>

                    {/*    时间计时器*/}
                    <Progress.Circle
                        size={this.state.circleSize}
                        width={this.state.circleSize}
                        height={this.state.circleSize}
                        thickness={20}
                        borderRadius={10}
                        strokeCap={this.state.percents>0 ? 'round':'butt'}
                        progress={ this.state.percents/100 }
                        borderWidth={0}
                        unfilledColor={'rgba(255,255,255,.3)'}
                        color={"#fff"} >
                    </Progress.Circle>
                    <View style={style.timeContainer}>
                        <Text style={style.timeLable}>{ this.state.count }</Text>
                        <Text style={style.unitLable}>min</Text>
                    </View>
                    <Animated.View style={[style.timeBeContainer0, {transform: [{scale: scale}],opacity:this.state.o} ]} />
                    <View style={[style.timeBeContainer0]} />
                    <View style={style.timeBeContainer1} />
                    <View style={style.timeBeContainer2} />
                    <View style={style.timeBeContainer3} />
                    <View style={style.timeBeContainer4} />
                    <View style={style.timeBeContainer5} />
                    <View style={style.timeBeContainer6} />
                    <View style={style.timeBeContainer7} />
                    <View style={style.timeBeContainer9} />
                    <View style={style.timeBeContainer8} />
                    <View style={style.timeBeContainer10} />

                </View>
                <View style={style.rowContainer}>
                    {/*    选择按钮*/}
                    <Text style={style.tabLable} onPress={() => this.props.navigation.navigate('Selects', { 'title': '烘干时间表' })}>帮我计算干衣时间 ></Text>
                </View>
                <View style={style.rowContainer}>
                    {/*    功能按键*/}
                    <View style={style.butBox}>
                        <TouchableOpacity style={[style.butIcon,{backgroundColor:this.state.status ? 'rgba(255,255,255,.30000000000000)' : 'transparent'}]} onPress={this.setRun} >
                            <Image source={ this.state.statusImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={this.setRun}>{ this.state.statusText }</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity style={style.butIcon} onPress={this.onPressReduce} >
                            <Image source={ this.state.reduceImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={this.onPressReduce}>{ this.state.reduceText }</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity style={style.butIcon} onPress={this.setPlusNum} >
                            <Image source={ this.state.plusImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={this.setPlusNum}>{ this.state.plusText }</Text>
                    </View>
                </View>
            </View>
        )
    }


    sendRemoteRequest =()=> {
        let params = this.state.params;
        let method = this.state.method;
        let extra = this.state.extra;
        if (method == '') {
            alert('method 不能为空')
            return;
        }
        Device.getDeviceWifi().callMethodFromCloud(method, {value:'on'}).then(res => {
            let result = JSON.stringify(res);
            this.setState({ result })
        }).catch(err => {
            let result = JSON.stringify(err);
            result = "Error: \n" + result;
            this.setState({ result })
        })
    };

    clearParams() {
        this.setState({ params: {}, extra: {}, paramsString: '', extraString: '', method: '' })
    }
}
Package.entry(App, () => {

})

const style = StyleSheet.create({
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
        borderColor:'rgba(255,255,255,0)',
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
        borderColor:'rgba(255,255,255,0)',
        borderRadius:150,
        width:250,
        height:250
    },
    timeBeContainer0:{
        opacity:0,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:309,
        height:309,
        // transform:[{rotate: '90deg' }]

    },
    timeBeContainer1:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:200,
        width:273,
        height:273,
        // transform:[{rotate: this.spin }]

    },
    timeBeContainer2:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:160,
        width:277,
        height:277
    },
    timeBeContainer3:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:160,
        width:281,
        height:281
    },
    timeBeContainer4:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:160,
        width:285,
        height:285
    },
    timeBeContainer5:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:160,
        width:289,
        height:289
    },
    timeBeContainer6:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:160,
        width:293,
        height:293
    },
    timeBeContainer7:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:160,
        width:297,
        height:297
    },
    timeBeContainer8:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:160,
        width:301,
        height:301
    },
    timeBeContainer9:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
        borderRadius:160,
        width:305,
        height:305
    },
    timeBeContainer10:{
        // opacity:0.3,
        position:'absolute',
        borderWidth:1,
        borderColor:'rgba(255,255,255,.3)',
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
        borderRadius:16,
        height:26,
        width:110,
        alignItems:'center',
        justifyContent:'center'
    },
    overTimeText:{
        color:'#fff',
        height: 26,
        textAlign:'center',
        alignItems:'center',
        justifyContent:'center',
        textAlignVertical:'center',
        // lineHeight:30,
        ...Platform.select({
            ios:{lineHeight:30},
            android:{}
        })
        // textAlign: 'center',
        // paddingTop: 5,
        // paddingBottom: 5
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
