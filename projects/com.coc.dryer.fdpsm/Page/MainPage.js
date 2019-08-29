import React from 'react';
import { API_LEVEL, Package, Device, Service, Host, PackageEvent,ISpecProperty } from 'miot';
import Selects from './Select';
import { DeviceEventEmitter, NativeModules, Animated, Easing, Image, ListView, PixelRatio, StyleSheet, Text, View ,TouchableOpacity, Platform } from 'react-native';
// import ProgressCircle from '../CommonModules/progress-circle';
import * as Progress from 'react-native-progress';
import Svg, { G,Circle, Path } from 'react-native-svg';
import {MessageDialog} from "miot/ui";

let Dimensions = require('Dimensions');
let {width,height} = Dimensions.get("screen");//第一种写法
const { UIManager } = NativeModules;
let requestStatus = 0;
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
            getParamText: '工作中......',
            step: 10,  //步进
            longStep:40,
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
            aniStatus:true,//动画锁
            circleSize:250,
            svgSize:312,
            svgCircleSize:156,
            svgCircleBorder:1,
            svgCircleFill:'none',
            svgCircleR:[134,136,138,140,142,144,146,148,150,152],
            svgCircleStroke:'rgba(255,255,255,.3)',

            visMessage: false,

            siid:3,
            leftTimePiid:1,// 1:left-time, 2:error-code, 3:power, 4:mode, 5:end-status
            errorCodePiid:2,// 1:left-time, 2:error-code, 3:power, 4:mode, 5:end-status
            powerPiid:3,// 1:left-time, 2:error-code, 3:power, 4:mode, 5:end-status
            modePiid:4,// 1:left-time, 2:error-code, 3:power, 4:mode, 5:end-status
            endStatusPiid:5,// 1:left-time, 2:error-code, 3:power, 4:mode, 5:end-status
            setTimeAiid:1,// 1:set-time, 2:set-power, 3:set-mode
            setPowerAiid:2,// 1:set-time, 2:set-power, 3:set-mode
            setModeAiid:3,// 1:set-time, 2:set-power, 3:set-mode
            endSendEiid:1,// 1:end-send, 2:button-pressed, 3:error-send
            buttonPressedEiid:2,// 1:end-send, 2:button-pressed, 3:error-send
            errorSendEiid:3,// 1:end-send, 2:button-pressed, 3:error-send

            requestStatus: -1,

            did: Device.deviceID,
            method: 'get_properties',
            params: [{'value':'on'}],
            extra: {},
            paramsString: '',
            extraString: {},
            result: 'None',
            };
        // this.setAnimation = this.setAnimation.bind(this);
    }
    //缩放动画配置
    animateInfo = () =>{
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
    setAnimateStart =()=>{
        if(this.state.aniStatus && this.state.count>0) {
            this.setState({aniStatus:false,o:1,scaleValue:new Animated.Value(0)});
            Animated.loop(this.animateInfo()).start();
            console.log('loop true '+this.state.aniStatus)
        }
    };
    setAnimateStop =()=>{
        if(!this.state.aniStatus &&  this.state.count<=0) {
            this.setState({aniStatus:true,o:0,scaleValue:new Animated.Value(0)});
            Animated.loop(this.animateInfo()).stop();
            console.log('loop false '+this.state.aniStatus)
        }
    };
    //设置时间值
    setNum = (param) => {
        if(typeof param!= "number"){
            console.log('参数值类型错误');
            return false
        }
        this.setState({
            count: param,
            percents: this.state.status ? param/this.state.max*100 : 0,
            time: this.setTime(param)
        });
    };
    setCountdown = (number) => {
        this.timer && clearInterval(this.timer);
        if(this.state.count>0){
            let param = number || this.state.count;
            // this.setNum(param);
            if(this.state.status){
                this.setState({statusText: this.state.offText});
                this.setAnimateStart()
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
                        this.setNum(0);
                        this.setState({
                            status: false,
                            statusText: this.state.onText,
                            // o: 0,
                            scaleValue : new Animated.Value(0)
                            // statusImg: require('../Resources/dryer/switch.png')
                        });
                        this.setAnimateStop()
                    }
                },
                60000
            );

        }else{
            this.timer && clearInterval(this.timer);
            this.setAnimateStop();//动画停止
            this.setNum(this.state.min);
            this.setState({
                status: false,
                statusText: this.state.onText,
                // o: 0,
                scaleValue : new Animated.Value(0)
            });
        }
    };
    setRun=(count)=>{
        if(!this.state.status){
            this.setState({status:true,count:this.state.count>0?this.state.count:120});
            console.log('open : '+this.state.status);
        }else{
            this.setState({status:false,count:0,getParam:0,o:0});
            this.setAnimateStop();//动画停止
            console.log('close : '+this.state.status+':'+this.state.count);
        }
    };
    setPlusNum=(num)=>{

        if(this.state.count<=this.state.max-this.state.step){
            this.setNum(this.state.count+this.state.step);
        }else{
            this.setState({count: this.state.max});
        }
    };
    setLongPlusNum=()=>{
        this.timerCount && clearInterval(this.timerCount);
        this.timerCount = setInterval(()=>{
            if(this.state.count<=this.state.max-this.state.longStep){
                this.setNum(this.state.count+1);
            }else{
                this.setState({count: this.state.max});
            }
        },25)

    };
    setReduceNum=(num)=>{

        if(this.state.count>=this.state.min+this.state.step){
            this.setNum(this.state.count-this.state.step);
        }else{
            this.setState({count: this.state.min});
        }
    };
    setLongReduceNum=()=>{
        this.timerCount && clearInterval(this.timerCount);
        this.timerCount = setInterval(()=>{
            if(this.state.count>=this.state.min+this.state.longStep){
                this.setNum(this.state.count-1);
            }else{
                this.setState({count: this.state.min});
            }
        },25)
    };
    outRun=(num)=>{
        this.timerCount && clearInterval(this.timerCount);
        this.requestClock();
        this.setNum(this.state.count);
        this.runLoop = setInterval(()=>{
            if(requestStatus == 0){
                console.log('发送开关机请求');
                this._sendRequests('setPower',num>0? num: this.state.count);
                this.runLoop && clearInterval(this.runLoop);
            }
        },1000)
    };
    longOut=()=>{
        this.timerCount && clearInterval(this.timerCount);
        this.runLoop && clearInterval(this.runLoop);
        this.requestClock();

        this.runLoop = setInterval(()=>{
            if(requestStatus == 0){
                this.setNum(this.state.count);
                console.log('发送时间请求');
                this._sendRequests('setLeftTime',this.state.count);
                this.setCountdown(this.state.count);
                this.runLoop && clearInterval(this.runLoop);
            }else{
                console.log('执行跳过 : '+requestStatus);
            }
        },1000)
    };
    requestClock =(t)=>{
        this.request && clearInterval(this.request);
        let time = 50;
        this.request = setInterval(()=>{
            time=time-1;
            // console.log(time+' : '+requestStatus);
            // this.setState({requestStatus:time});
            requestStatus = time;
            if(time<=0){
                this.request && clearInterval(this.request);
                setTimeout(()=>{
                    // this.setState({requestStatus:-1});
                    requestStatus=-1
                },5000);
                // console.log(time-1+' : '+this.state.requestStatus);
            }
        },10);
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
        // if(Host.isIOS){alert(typeof params)}
        Device.getDeviceWifi().callMethod(method,params).then(res => {
            let result = JSON.stringify(res);
            let arrys = JSON.parse(result);
            this.setState({
                status: arrys.result[2].value=='on' ? true:false,
                aniStatus: arrys.result[2].value=='on' ? true:false,
                result
            });
            this.setNum(arrys.result[0].value);
            setTimeout(()=>{
                this.setCountdown(this.state.count);
            },10);
            console.log('成功 '+':'+this.state.result);
            // if(Host.isIOS){alert('成功 '+':'+this.state.result)}
        }).catch(err => {
            console.log('error:', err);
            let result = JSON.stringify(err);
            result = "Error: \n" + result;
            this.setState({ result });
            console.log('失败 '+result);
            // if(Host.isIOS){alert('失败 '+result)}
        })
    };
    async setPower(value){
        const did = Device.deviceID;
        let setPower = { did, siid: 3, piid: 3, value: value };
        Service.spec.setPropertiesValue([setPower]).then(res => {
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
        let setPower = { did, siid: 3, piid: 3, value: value>0? 'on':'off' };

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
                    this.setCountdown(value);
                    console.log('setValue : ', this.state.count);
                    console.log('setPropertiesValue : ', res);
                    // this.getRequest();
                }).catch(res => {
                    console.log(res, 'catch')
                });
                break;
            case 'setPower':
                Service.spec.setPropertiesValue([setLeftTime,setPower]).then(res => {
                    console.log('setPower : '+value);
                    console.log('setPropertiesValue', res);
                    this.getRequest();
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
                    let result = JSON.stringify(res);
                    let arrys = JSON.parse(result);
                    this.setState({
                        status: arrys.result[0].value>0 ? true:false,
                        aniStatus: arrys.result[0].value>0 ? true:false,
                        result
                    });
                    this.setNum(arrys.result[0].value);
                    setTimeout(()=>{
                        this.setCountdown(this.state.count);
                    },10);
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
        Animated.loop(this.animateInfo()).start();
        PackageEvent.packageWillPause.addListener(()=>{
            console.log('我离开了');
            // if(Host.isIOS){alert('我离开了')}
        });
        PackageEvent.packageDidResume.addListener(()=>{
            console.log('我又回来了');
            // if(Host.isIOS){alert('我又回来了')}
            this.getRequest()
        });
        this.getRequest();
        // this.sendRequests('setLeftTime',60);
        //获取设备状态-
        this.subscription = DeviceEventEmitter.addListener("EventType", (param)=>{
            // 接收传参并执行写入

            if(param>0){
                this.setNum(param);
                setTimeout(()=>{
                    this.setCountdown(param);
                },100);
                this.setState({
                    getParam:param
                });
                this.outRun(param)
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
                        strokeCap={this.state.status && this.state.count>0 ? 'round':'butt'}
                        progress={ this.state.status ? this.state.count/this.state.max*100/100 : 0 }
                        // progress={ this.state.percents/100 }
                        borderWidth={0}
                        unfilledColor={'rgba(255,255,255,.3)'}
                        color={"#fff"} >
                    </Progress.Circle>
                    <View style={style.timeContainer}>
                        <Text style={style.timeLable}>{ this.state.count }</Text>
                        <Text style={style.unitLable}>min</Text>
                    </View>
                    <Animated.View style={[style.timeBeContainer0, {transform: [{scale: scale}],opacity:this.state.o} ]} />
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[0]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[1]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[2]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[3]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[4]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[5]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[6]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[7]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[8]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                    <View style={style.timeBeContainerCircle} ><Svg height={this.state.svgSize} width={this.state.svgSize}><Circle cx={this.state.svgCircleSize} cy={this.state.svgCircleSize} r={this.state.svgCircleR[9]} stroke={this.state.svgCircleStroke}　strokeWidth={this.state.svgCircleBorder} fill={this.state.svgCircleFill}/></Svg></View>
                </View>
                <View style={style.rowContainer}>
                    {/*    选择按钮*/}
                    <Text style={style.tabLable} onPress={() => this.state.getParam<=0?this.props.navigation.navigate('Selects', { 'title': '烘干时间表' }):''}>{this.state.getParam<=0?'帮我计算干衣时间 >': this.state.getParamText}</Text>
                </View>
                <View style={style.rowContainer}>
                    {/*    功能按键*/}
                    <View style={style.butBox}>
                        <TouchableOpacity style={[style.butIcon,{backgroundColor:this.state.status ? 'rgba(255,255,255,.30000000000000)' : 'transparent'}]} onPress={()=>this.setRun()} onPressOut={()=>this.outRun()}>
                            <Image source={ this.state.statusImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={()=>this.setRun()} onPressOut={()=>this.outRun()}>{ this.state.statusText }</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity style={style.butIcon} onPress={()=>this.setReduceNum()} delayLongPress={2000} onLongPress={()=>this.setLongReduceNum()} onPressOut={()=>this.longOut()}>
                            <Image source={ this.state.reduceImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={()=>this.setReduceNum()} delayLongPress={2000} onLongPress={()=>this.setLongReduceNum()} onPressOut={()=>this.longOut()}>{ this.state.reduceText }</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity style={style.butIcon} onPress={()=>this.setPlusNum()} delayLongPress={2000} onLongPress={()=>this.setLongPlusNum()} onPressOut={()=>this.longOut()}>
                            <Image source={ this.state.plusImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={()=>this.setPlusNum()} delayLongPress={2000} onPressOut={()=>this.longOut()} onLongPress={()=>this.setLongPlusNum()}>{ this.state.plusText }</Text>
                    </View>
                </View>
                <MessageDialog title={'title'}
                               message={'message'}
                               cancelable={true}
                               // cancel={'取消'}
                               confirm={'确认'}
                               timeout={10000}
                               onCancel={(e) => {
                                   console.log('onCancel', e);
                               }}
                               onConfirm={(e) => {
                                   console.log('onConfirm', e);
                               }}
                               onDismiss={() => {
                                   console.log('onDismiss');
                                   this.setState({ visMessage: false });
                               }}
                               visible={this.state.visMessage} />
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
    timeBeContainerCircle:{
        position:'absolute',
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
