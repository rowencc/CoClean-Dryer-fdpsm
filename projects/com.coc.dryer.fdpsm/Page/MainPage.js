import React from 'react';
import { API_LEVEL, Package, Device, Service, Host, PackageEvent, DeviceEvent,ISpecProperty } from 'miot';
import Selects from './Select';
import { DeviceEventEmitter, NativeModules, Animated, Easing, Image, ListView, PixelRatio, StyleSheet, Text, View ,TouchableOpacity, Platform } from 'react-native';
// import ProgressCircle from '../CommonModules/progress-circle';
import * as Progress from 'react-native-progress';
import Svg, { G,Circle, Path } from 'react-native-svg';
import {MessageDialog} from 'miot/ui/Dialog';

let Dimensions = require('Dimensions');
let {width,height} = Dimensions.get("screen");//第一种写法
const { UIManager } = NativeModules;
let requestStatus = 0;
let devieStatus = false;

// const getEvents = DeviceEvent.deviceReceivedMessages.addListener((device, messages)=>{
//     if(messages.has('prop.power')){
//         const power = messages.get('prop.power');
//     }
//     console.log(JSON.stringify(messages))
// });

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
            selectTitle: '烘干时间表',
            selectText: '帮我计算干衣时间 >',
            error:false,
            errorText:'设备异常，请检查是否倾倒或跌落。',
            closeOneMin: '为保护主机，风扇将在一分钟后关闭......',
            closing: '设备正在关机......',
            step: 10,  //步进
            longStep:40,
            status: false, //开关状态
            statusText: '开机', //开关文字描述
            onText: '开机', //关机文字描述
            offText: '关机', //开机文字描述
            statusImg: require('../Resources/dryer/switch-big.png'), //开关文字描述
            plusText: '加时', //加时文字描述
            plusImg: require('../Resources/dryer/plus-big.png'), //加时按钮图片
            reduceText: '减时', //减时文字描述
            reduceImg: require('../Resources/dryer/reduce-big.png'), //减时按钮图片
            overTimeText: '待开机',
            time: this.setTime(0), // 获取预计完成时间
            o: 0,//动画光环隐显  关闭状态下 隐藏，开启状态下  显示
            scaleValue : new Animated.Value(0),
            aniClock:true,//动画锁
            circleSize:width*.79-65,
            svgSize:width*.79,
            svgCircleSize:width*.79/2,
            svgCircleBorder:1,
            svgCircleFill:'none',
            svgCircleR:[width*.79/2-22,width*.79/2-20,width*.79/2-18,width*.79/2-16,width*.79/2-14,width*.79/2-12,width*.79/2-10,width*.79/2-8,width*.79/2-6,width*.79/2-4],
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

            requestStatus: null,

            did: Device.deviceID,
            method: 'get_properties',
            params: [{'value':'on'}],
            extra: {},
            paramsString: '',
            extraString: {},
            result: 'None',

            //监听事件
            getEvent:''
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
        // if(this.state.aniClock && this.state.count>0) {
        if(this.state.count>0) {
            this.setState({aniClock:false,o:1,scaleValue:new Animated.Value(0)});
            Animated.loop(this.animateInfo()).start();
            // console.log('loop true '+this.state.aniClock)
        }
    };
    setAnimateStop =()=>{
        // console.log(!this.state.aniClock+":"+this.state.count);
        // if(!this.state.aniClock &&  this.state.count<=0) {
        if(this.state.count<=0) {
            this.setState({aniClock:true,o:0,scaleValue:new Animated.Value(0)});
            Animated.loop(this.animateInfo()).stop();
            // console.log('loop false '+this.state.aniClock)
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
            time: this.setTime(param),
        });
    };
    setCountdown = (number) => {
        this.timer && clearInterval(this.timer);
        console.log('运行状态：'+this.state.status);
        if(number>0){
            this.timer = setInterval(
                () => {
                    let count = this.state.count;
                    this.setState({
                        count: count-1,
                        percents: (count-1)/this.state.max*100,
                    });
                    if(this.state.count<=0){
                        this.timer && clearInterval(this.timer);
                        this.outRun(0);//设置开关机
                        this.setNum(0);
                        this.setState({
                            status: false,
                            statusText: this.state.onText,
                            scaleValue : new Animated.Value(0),
                            o:0
                        });
                        let getParamTime = setTimeout(()=>{
                            this.setState({getParam:0})
                        },50);
                        this.setAnimateStop()
                    }
                },
                60000
            );
        }
    };
    setRun=(count)=>{
        // this.getLoop&&clearInterval(this.getLoop);
        if(!this.state.status){
            this.setState({status:true,count:this.state.count>0?this.state.count:120});
            devieStatus = true;
            // console.log('open : '+this.state.status);
        }else{
            this.setState({status:false,count:0});
            devieStatus = false;
            this.setAnimateStop();//动画停止
            // console.log('close : '+this.state.status+':'+this.state.count);
        }
    };
    outRun=(num)=>{
        this.timerCount && clearInterval(this.timerCount);
        this.runLoop && clearInterval(this.runLoop);
        this.requestClock();
        this.setNum(num>0 ? num : this.state.count);
        this.runLoop = setInterval(()=>{
            if(requestStatus <= 0){
                console.log('发送开关机请求 outRun');

                this._sendRequests('setPower',num>0 ? num : this.state.count);
                setTimeout(()=>{if(num<=0){this.setState({getParam:0})}},500);
                this.runLoop && clearInterval(this.runLoop);
            }
        },1000);
        // setTimeout(()=>{this.getRequestLoop()},50);//计时器循环请求
    };
    setPlusNum=(num)=>{
        // this.getLoop&&clearInterval(this.getLoop);
        if(this.state.count<=this.state.max-this.state.step){
            this.setNum(this.state.count+this.state.step);
        }else{
            this.setState({count: this.state.max});
        }
    };
    setLongPlusNum=()=>{
        this.timerCount && clearInterval(this.timerCount);
        // this.getLoop&&clearInterval(this.getLoop);
        this.timerCount = setInterval(()=>{
            if(this.state.count<=this.state.max-this.state.longStep){
                this.setNum(this.state.count+1);
            }else{
                this.setState({count: this.state.max});
            }
        },25)

    };
    setReduceNum=(num)=>{
        // this.getLoop&&clearInterval(this.getLoop);
        if(this.state.count>=this.state.min+this.state.step){
            this.setNum(this.state.count-this.state.step);
        }else{
            this.setState({count: this.state.min});
            setTimeout(()=>{this.setState({getParam:0})},500);
        }
    };
    setLongReduceNum=()=>{
        this.timerCount && clearInterval(this.timerCount);
        // this.getLoop&&clearInterval(this.getLoop);
        this.timerCount = setInterval(()=>{
            if(this.state.count>=this.state.min+this.state.longStep){
                this.setNum(this.state.count-1);
            }else{
                this.setState({count: this.state.min});
                setTimeout(()=>{this.setState({getParam:0})},500);
            }
        },25)
    };
    longOut=()=>{
        this.timerCount && clearInterval(this.timerCount);
        this.timeLoop && clearInterval(this.timeLoop);
        this.requestClock();

        this.timeLoop = setInterval(()=>{
            if(requestStatus <= 0){
                this.setNum(this.state.count);

                if(devieStatus==true){
                    console.log('发送时间请求');
                    this._sendRequests('setLeftTime',this.state.count);
                    this.setCountdown(this.state.count);
                    this.timeLoop && clearInterval(this.timeLoop);
                }
                this.timeLoop && clearInterval(this.timeLoop);
                console.log(requestStatus)
            }else{
                // this.runLoop && clearInterval(this.runLoop);
                console.log('执行跳过 : '+requestStatus);
            }
        },1000);
        // setTimeout(()=>{this.getRequestLoop()},50);//计时器循环请求
    };
    requestClock =(t)=>{
        this.request && clearInterval(this.request);
        let time = 50;
        this.request = setInterval(()=>{
            time=time-1;
            requestStatus = time;
            // console.log(time+' : '+requestStatus);
            // this.setState({requestStatus:time});
            if(requestStatus<=0){
                this.request && clearInterval(this.request);
                setTimeout(()=>{
                    // this.setState({requestStatus:-1});
                    requestStatus=0
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
        Device.getDeviceWifi().callMethod(method,params).then(res => {
            let result = JSON.stringify(res);
            let arrys = JSON.parse(result);
            let status = arrys.result[2].value=='on' ? true:false;
            if(status != this.state.status || arrys.result[0].value != this.state.count){
                this.setState({
                    status: arrys.result[2].value=='on' ? true:false,
                    aniClock: arrys.result[2].value=='on' ? true:false,
                    // getParam: arrys.result[2].value=='off'? 0 : 1,
                    result
                });
                devieStatus = arrys.result[2].value=='on' ? true:false;
                this.setNum(arrys.result[0].value);
                setTimeout(()=>{
                    this.setCountdown(this.state.count);
                },10);
                // alert(arrys.result[2].value);
                if(arrys.result[2].value=='off'){
                    setTimeout(()=>{this.setState({getParam:0})},500);
                }
                if(!this.state.aniClock){
                    this.setAnimateStop()
                }else{
                    this.setAnimateStart()
                }
                // console.log('getLoop : change')
            }else{
                // console.log('getLoop : pass')
            }
            // console.log('成功 '+':'+this.state.result);
            // if(Host.isIOS){alert('成功 '+':'+this.state.result)}
        }).catch(err => {
            console.log('error:', err);
            let result = JSON.stringify(err);
            result = "Error: \n" + result;
            this.setState({ result });
            // console.log('失败 '+result);
            // if(Host.isIOS){alert('失败 '+result)}
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
                    // console.log('setValue : ', this.state.count);
                    // console.log('setPropertiesValue : ', res);
                    // this.getRequest();
                    if(value==0){
                        this.setState({visMessage:true});
                        this.setState({getParam:0});
                    }
                }).catch(res => {
                    console.log(res, 'catch')
                });
                break;
            case 'setPower':
                Service.spec.setPropertiesValue([setLeftTime,setPower]).then(res => {
                    // console.log('setPower : '+value);
                    // console.log('setPropertiesValue', res);
                    setTimeout(()=>{this.getRequest()},0);
                    if(value<=0){
                        if(this.state.count>=360)this.setState({count:359});
                        setTimeout(()=>{
                            if(!this.state.aniClock){this.setAnimateStop()}//动画停止
                            this.setState({visMessage:true,getParam:0,statusText: this.state.onText, scaleValue : new Animated.Value(0)});
                        },500)
                    }else{
                        this.setState({visMessage:false,statusText: this.state.offText});
                        if(this.state.aniClock){this.setAnimateStart()}
                    }
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
                        aniClock: arrys.result[0].value>0 ? true:false,
                        result
                    });
                    devieStatus = arrys.result[0].value>0 ? true:false
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
    componentDidMount() {
        Animated.loop(this.animateInfo()).start();
        this.outPackage = PackageEvent.packageWillPause.addListener(()=>{
            console.log('我离开了');
            this.setState({o:0})
            // if(Host.isIOS){alert('我离开了')}
        });
        this.backPackage = PackageEvent.packageDidResume.addListener(()=>{
            console.log('我又回来了');
            // if(Host.isIOS){alert('我又回来了')}
            if(this.state.status){
                this.setState({o:1})
            }
            this.getRequest()
        });
        //接收传参
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
        this.getRequest();
        Device.getDeviceWifi().subscribeMessages("event.3.1", "event.3.2", "event.3.3", "event.3.4").then(res => {
            // this.getRequest();
            console.log('subscribeMessages ：',res);

        }).catch(res => {
            console.log(res, 'catch')
        });

        DeviceEvent.deviceReceivedMessages.addListener((device, map, res) => {
            // console.log('Device.addListener', device, map, res);
            // console.log(res[0].key=='event.3.3');
            if(res[0].key=='event.3.3'){
                if(res[0].value[0].value!=2){
                    this.setState({error:true});
                }else{
                    this.setState({error:false});
                }
                // console.log('错误值 ：',res[0].value[0].value);
            }
            this.getRequest();
        });
    }
    componentWillUnmount() {
        // this.subscription&&this.subscription.remove();
        this.outPackage&&this.outPackage.remove();
        this.backPackage&&this.backPackage.remove();

        // this._deviceStatusListener && this._deviceStatusListener.remove();
        this._deviceNameChangedListener && this._deviceNameChangedListener.remove();
    }
    getRequestLoop = (n)=>{
        let loop = n || 5;
        this.getLoop&&clearInterval(this.getLoop);
        this.getLoop = setInterval(()=>{
            if(!this.state.status){this.getLoop&&clearInterval(this.getLoop);}
            loop = loop-1;
            if(loop<=0){
                loop = 3;
                this.getRequest();
            }
            console.log('getLoop : '+loop);
        },1000)
    };
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
    goToSelect = ()=>{
        if(this.state.getParam<=0){
            // this.getLoop&&clearInterval(this.getLoop);
            this.props.navigation.navigate('Selects', { 'title': this.state.selectTitle })
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
                        <Text style={style.overTimeText}>{ !this.state.status ?this.state.overTimeText : '约'+this.state.time+'完成'}</Text>
                    </View>
                </View>
                <View style={{flex:1,justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: height*.05,
                    marginTop: -height*.01,
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
                    <Text style={style.tabLable} onPress={() => this.goToSelect()}>{this.state.getParam<=0 ? this.state.selectText : this.state.getParamText}</Text>
                </View>
                <View style={style.rowContainer}>
                    {/*    功能按键*/}
                    <View style={style.butBox}>
                        <TouchableOpacity style={[style.butIcon,{backgroundColor:this.state.status ? 'rgba(255,255,255,.30000000000000)' : 'transparent'}]} onPress={()=>this.setRun()} onPressOut={()=>this.outRun()}>
                            <Image style={{width:32,height:30}} source={ this.state.statusImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={()=>this.setRun()} onPressOut={()=>this.outRun()}>{ this.state.statusText }</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity style={style.butIcon} onPress={()=>this.setReduceNum()} delayLongPress={1500} onLongPress={()=>this.setLongReduceNum()} onPressOut={()=>this.longOut()}>
                            <Image style={{width:32,height:30}} source={ this.state.reduceImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={()=>this.setReduceNum()} delayLongPress={1500} onLongPress={()=>this.setLongReduceNum()} onPressOut={()=>this.longOut()}>{ this.state.reduceText }</Text>
                    </View>
                    <View style={style.butBox}>
                        <TouchableOpacity style={style.butIcon} onPress={()=>this.setPlusNum()} delayLongPress={1500} onLongPress={()=>this.setLongPlusNum()} onPressOut={()=>this.longOut()}>
                            <Image style={{width:32,height:30}} source={ this.state.plusImg } />
                        </TouchableOpacity>
                        <Text style={style.butLable} onPress={()=>this.setPlusNum()} delayLongPress={1500} onPressOut={()=>this.longOut()} onLongPress={()=>this.setLongPlusNum()}>{ this.state.plusText }</Text>
                    </View>
                </View>
                <MessageDialog
                    visible={this.state.visMessage}
                    message={this.state.closeOneMin}
                    buttons={[
                       {
                           text: '我知道了',
                           callback: _ => this.setState({ visMessage: false })
                       },
                   ]}
                />

                <MessageDialog
                    visible={this.state.error}
                    message={'设备异常，请检查：\n1. 产品是否倾倒或跌落；\n2. 主机进风口或出风口是否被遮挡。'}
                    buttons={[
                        {
                            text: '我知道了',
                            callback: _ => this.setState({ error: false })
                        },
                    ]}
                />
            </View>
        )
    }

}
Package.entry(App, () => {});

const style = StyleSheet.create({
    navigate: {
        backgroundColor: 'transparent',
    },
    container: {
        width: width,
        height: height-90,
        backgroundColor: '#0892fe',
        // backgroundColor: '#0e62bd',
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
        width:width*.75,
        height:width*.75,
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
        width:width*.75,
        height:width*.75
    },
    timeBeContainer0:{
        opacity:0,
        position:'absolute',
        borderWidth:1,
        borderColor:'#fff',
        borderRadius:160,
        width:width*.77,
        height:width*.77,
        // transform:[{rotate: '90deg' }]

    },
    timeBeContainerCircle:{
        position:'absolute',
    },
    tabLable:{
        marginLeft: 5,
        marginRight: 5,
        paddingTop:5,
        paddingBottom:5,
        fontSize: 14,
        color:'#fff'
    },
    timeLable:{
        marginLeft: 5,
        marginRight: 5,
        color:'#fff',
        ...Platform.select({
            ios:{
                lineHeight:width<359?width*.15:68,
                fontSize: width<359?width*.15:68
            },
            android:{
                lineHeight:width<359?width*.15:58,
                fontSize: width<359?width*.15:58
            }
        })
    },
    unitLable:{
        marginLeft: 5,
        marginRight: 5,
        color:'#fff',
        ...Platform.select({
            ios:{
                lineHeight:width<359?width*.08:42,
                fontSize: width<359?width*.08:42
            },
            android:{
                lineHeight:width<359?width*.08:32,
                fontSize: width<359?width*.08:32
            }
        })
    },
    butBox:{
        flex:1,
        alignItems: 'center',
        justifyContent:'center',
        height:60,
    },
    butIcon:{
        // flex:60,
        alignItems: 'center',
        justifyContent:'center',
        height:60,
        width:60,
        borderWidth:1.3,
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
        // height:26,
        marginTop:height*.03,
        alignItems:'center',
        justifyContent:'flex-start'
    },
    overTime:{
        borderWidth:1.3,
        borderColor:'#fff',
        borderRadius:height*.1,
        // height:26,
        width:110,
        alignItems:'center',
        justifyContent:'center'
    },
    overTimeText:{
        color:'#fff',
        textAlign:'center',
        alignItems:'center',
        justifyContent:'center',
        textAlignVertical:'center',
        ...Platform.select({
            ios:{
                fontSize:width<359?width*.04:14,
                lineHeight:width<359?width*.06:26,
                paddingTop: 2,
                paddingBottom: 2
            },
            android:{
                fontSize:width<359?width*.015:14,
                lineHeight:width<359?width*.03:26,
            }
        })
    }
});