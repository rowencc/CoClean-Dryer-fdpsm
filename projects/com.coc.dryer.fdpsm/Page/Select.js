import React from 'react';
import {DeviceEventEmitter, Image, PixelRatio, Platform, StyleSheet, TouchableOpacity} from 'react-native'
import Pickers from '../CommonModules/pickers.js';
import {
    View,
    Text,
} from 'react-native';
import TitleBar from "miot/ui/TitleBar";
import {strings} from "miot/resources";
import {NumberSpinner, StringSpinner} from 'miot/ui'
import { AbstractDialog, ActionSheet, ChoiceDialog, InputDialog, LoadingDialog, MessageDialog, PinCodeDialog, ProgressDialog, ShareDialog } from 'miot/ui/Dialog';
import {PackageEvent} from "miot";
let Dimensions = require('Dimensions');
let {width,height} = Dimensions.get("screen");//第一种写法
let param = 0;
let classList=[];
let valueList=[];
export default class Selects extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            param:0,
            visMessage:false,
            overTimeText: '待开机',
            time: this.setTime(0), // 获取预计完成时间
            defaultClass:'内衣裤',
            defaultValue:'女士内衣',
            classList:[''],
            valueList:[''],
            contentList:[
                {id:1, name:'内衣裤', list:[
                    {id:100,name:'女士内衣',value:150},
                    {id:101,name:'抹胸',value:90},
                    {id:102,name:'内裤',value:60},
                    {id:103,name:'吊带背心',value:30},
                    {id:104,name:'速干背心',value:30},
                    {id:105,name:'纯棉背心',value:90},
                ]},
                {id:2,name:'上装',list:[
                    {id:200,name:'衬衫',value:90},
                    {id:201,name:'Polo衫',value:90},
                    {id:202,name:'T恤',value:60},
                    {id:203,name:'轻薄睡衣',value:60},
                    {id:204,name:'纯棉睡衣',value:150},
                    {id:205,name:'卫衣',value:240},
                    {id:206,name:'风衣',value:250},
                    {id:207,name:'棒球服',value:240},
                    {id:208,name:'短外套',value:240},
                    {id:209,name:'长外套',value:270},
                    {id:210,name:'牛仔外套',value:300}
                ]},
                {id:3,name:'下装',list:[
                    {id:300,name:'速干运动短裤',value:30},
                    {id:301,name:'速干运动长裤',value:30},
                    {id:302,name:'棉质运动短裤',value:120},
                    {id:303,name:'棉质运动长裤',value:150},
                    {id:304,name:'半身裙',value:150},
                    {id:305,name:'连衣裙',value:180},
                    {id:306,name:'牛仔短裤',value:150},
                    {id:307,name:'牛仔长裤',value:180},
                    {id:308,name:'西裤',value:120},
                    {id:309,name:'棉质打底裤',value:120},

                ]},
                {id:4,name:'毛巾',list:[
                    {id:400,name:'婴儿口水巾',value:30},
                    {id:401,name:'棉质方巾',value:60},
                    {id:402,name:'长毛巾',value:120},
                    {id:403,name:'擦头巾',value:90},
                    {id:404,name:'浴巾',value:240},
                ]},
                {id:5,name:'袜子',list:[
                    {id:500,name:'棉质船袜',value:30},
                    {id:501,name:'棉质短袜',value:60},
                    {id:502,name:'棉质长袜',value:60},
                    {id:503,name:'居家地板袜',value:90}
                ]},
                {id:6,name:'其他',list:[
                    {id:600,name:'保暖护腰',value:180},
                    {id:601,name:'加棉护膝',value:120},
                    {id:602,name:'薄护膝',value:60},
                    {id:603,name:'枕套',value:60},
                    {id:604,name:'帽子',value:120},
                    {id:604,name:'书包',value:180},
                    {id:604,name:'毛绒玩具',value:180}
                ]}
            ],
            defaultIndexs: [1, 0], // 指定选择每一级的第几项，可以不填不传，默认为0(第一项)
            confirmImg: require('../Resources/dryer/confirm.png'),
            confirmFocusImg: require('../Resources/dryer/confirm-focus.png'),
            confirmNullImg: require('../Resources/dryer/confirm.png'),
            visible: true,
        };
    }
    setTime = (param) => {
        // if(param != 0){
        //     params = this.state.getParam;
        // }
        // let paramTime = {
        //     hours:Math.floor(param/60),
        //     minute:Math.floor(Math.floor(param%60))
        // };
        // let tomorrow = '';
        // let date = new Date();
        // let year = date.getFullYear().toString();
        // let month = (date.getMonth()+1).toString();
        // let day = date.getDate().toString();
        // let hourNumber =  date.getHours()+paramTime.hours;
        // let minuteNumber = date.getMinutes()+paramTime.minute;
        // if(minuteNumber>0) {
        //     hourNumber = hourNumber + Math.floor(minuteNumber/60);
        //     minuteNumber = minuteNumber%60;
        // }
        // if(hourNumber>=24){
        //     hourNumber = hourNumber%24;
        //     if(hourNumber.toString()===1) hourNumber='0'+hourNumber.toString();
        //     tomorrow = '明天 ';
        // }
        // let hour =  hourNumber.toString();
        // let minute = minuteNumber.toString();
        // if(hour.length===1) hour = '0'+hour;
        // if(minute.length===1) minute = '0'+minute;
        // return hour+':'+minute;
        return param
    };
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
                    // type='dark'
                    title='干衣时间'
                    style={{ backgroundColor: '#0e62bd' }}
                    onPressLeft={_ => {
                        navigation.goBack();
                    }}
                />
        };
    };
    componentDidMount() {
        this.formatData();
        this.selectData(this.state.defaultValue);
        this.setState({visMessage:true});
    }
    confirmProps =()=>{
        this.setState({
            confirmImg: require('../Resources/dryer/confirm-focus.png')
        });
        this.props.navigation.goBack();
        DeviceEventEmitter.emit("EventType", param);
    };
    updateOneValue = (data)=>{
        this.setState({
            param:data.newValue,
            defaultClass:data.newValue
        });
        this.selectData(data.newValue)

    };
    formatData =()=>{
        let mainList = this.state.contentList;
        classList=[];
        valueList=[];
        for(let i=0; i<mainList.length; i++){
            classList.push(mainList[i].name);
            for(let v=0; v<mainList[i].list.length; v++){
                valueList.push(mainList[i].list[v].name);
            }
        }
        this.setState({
            classList:classList,
            valueList:valueList
        });
    };
    selectData =(value)=>{
        let mainList = this.state.contentList;
        for(let i=0; i<mainList.length; i++){
            if(mainList[i].name == value){
                this.setState({
                    defaultValue:mainList[i].list[0].name
                });
                param = mainList[i].list[0].value;
                // alert(param);
                // return
            }
            for(let v=0; v<mainList[i].list.length; v++){
                if(mainList[i].list[v].name == value){
                    this.setState({
                        defaultClass:mainList[i].name,
                        param:mainList[i].list[v].value,
                        // defaultValue:mainList[i].list[v].name
                        time:this.setTime(mainList[i].list[v].value),
                        confirmImg: mainList[i].list[v].value>0? this.state.confirmFocusImg: this.state.confirmImg
                    });
                    param = mainList[i].list[v].value;
                    // alert(param);
                }
            }
        }

        // alert(JSON.stringify(classList));
        // alert(JSON.stringify(valueList));
    };
    onChange(arr) { // 选中项改变时触发, arr为当前每一级选中项索引，如选中B和Y，此时的arr就等于[1,1]
        console.log(arr)
    }
    onOk(arr) { // 最终确认时触发，arr同上
        console.log(arr)
    }
    onDismiss(index) {
        // if (index === '2') console.log('loadingdialog dismiss');
        // this.state['visible' + index] = false;
    }
    render(){
        return (
            <View style={{flex: 1,justifyContent: 'center',alignContent: 'center',backgroundColor:'#0e62bd'}}>
                <View style={style.overTimeBox}>
                    <View style={style.overTime}>
                        <Text style={style.overTimeText}>{ this.state.count <= 0 ?this.state.overTimeText : '约 '+this.state.time+'min 完成'}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row' ,flex:1,justifyContent: 'center',alignContent: 'center',marginTop:-150}}>

                    <StringSpinner
                        style={{ width: 120, height: 200, marginLeft: 10,backgroundColor: 'transparent' }}
                        dataSource={this.state.classList}
                        textColor="#ffffff"
                        defaultValue={this.state.defaultClass}
                        pickerInnerStyle={{ lineColor: "#ffffff", textClolor:'rgba(255,255,255,.8)', selectTextColor: "#ffffff", fontSize: 18, selectFontSize: 18, rowHeight: 40 }}
                        onValueChanged={(data) => { this.updateOneValue(data) }}
                    />

                    <StringSpinner
                        style={{ width: 120, height: 200, marginRight: 10,backgroundColor: 'transparent', }}
                        dataSource={this.state.valueList}
                        defaultValue={this.state.defaultValue}
                        textColor="#ffffff"
                        // unit={"斤"}
                        // rgba(255,255,255,.8)
                        pickerInnerStyle={{ lineColor: "#ffffff", textClolor:'rgba(255,255,255,.8)', selectTextColor: "#ffffff", fontSize: 18, selectFontSize: 18, rowHeight: 40 }}
                        onValueChanged={(data) => { this.updateOneValue(data) }}
                    />
                </View>
                <View style={style.butBox}>
                    {/*style={[style.butIcon,{backgroundColor:this.state.status ? 'rgba(255,255,255,.30000000000000)' : 'transparent'}]}*/}
                    <TouchableOpacity  onPress={()=>this.confirmProps()} >
                        <Image source={ this.state.confirmImg } />
                    </TouchableOpacity>
                </View>
                <MessageDialog
                    visible={this.state.visMessage}
                    message={'1.请确保衣物间留有一定空隙；\n2.根据最厚的一件衣物，来选择相应时间吧。'}
                    buttons={[
                        {
                            text: '我知道了',
                            // style: { color: 'lightpink' },
                            callback: _ => this.setState({ visMessage: false })
                        },
                    ]}
                    // onDismiss={_ => this.onDismiss('4')}
                />
            </View>
        )
    }
}

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
        height:115,
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
        marginTop:60,
        alignItems:'center',
        justifyContent:'flex-start'
    },
    overTime:{
        borderWidth:1,
        borderColor:'#ffffff',
        backgroundColor:'#ffffff',
        borderRadius:16,
        height:26,
        width:120,
        alignItems:'center',
        justifyContent:'center'
    },
    overTimeText:{
        color:'#0e62bd',

        height: 26,
        textAlign:'center',
        alignItems:'center',
        justifyContent:'center',
        textAlignVertical:'center',
        // lineHeight:30,
        ...Platform.select({
            ios:{lineHeight:34},
            android:{}
        })
        // textAlign: 'center',
        // paddingTop: 5,
        // paddingBottom: 5
    }
});

// var styles = StyleSheet.create({
//         cls2:{fill:'none',stroke:'#ffffff',strokeMiterlimit:10,strokeWidth:'0.5px'},
//         cls3:{fill:'none',stroke:'#ffffff',strokeMiterlimit:10,strokeLinecap:'round',strokeWidth:'2px'}
// });