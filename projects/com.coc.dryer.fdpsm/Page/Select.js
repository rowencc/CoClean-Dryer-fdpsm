import React from 'react';
import {DeviceEventEmitter, Image, PixelRatio, Platform, StyleSheet, TouchableOpacity} from 'react-native'
import Pickers from '../CommonModules/pickers.js';
import {
    View,
    Text,
} from 'react-native';
import TitleBar from "miot/ui/TitleBar";
import {strings} from "miot/resources";
import {MessageDialog, NumberSpinner, StringSpinner} from 'miot/ui'
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
            defaultClass:'内衣裤',
            defaultValue:'女士内衣',
            classList:[''],
            valueList:[''],
            contentList:[
                {id:1, name:'内衣裤', list:[
                    {id:100,name:'女士内衣',value:10},
                    {id:101,name:'抹胸',value:11},
                    {id:102,name:'内裤',value:12},
                    {id:103,name:'吊带背心',value:13},
                    {id:104,name:'速干背心',value:14},
                    {id:105,name:'纯棉背心',value:15},
                ]},
                {id:2,name:'上装',list:[
                    {id:200,name:'衬衫',value:20},
                    {id:201,name:'T恤',value:21},
                    {id:202,name:'轻薄睡衣',value:22},
                    {id:203,name:'纯棉睡衣',value:23},
                    {id:204,name:'卫衣',value:24},
                    {id:205,name:'风衣',value:25},
                    {id:206,name:'棒球服',value:26},
                    {id:207,name:'短外套',value:27},
                    {id:208,name:'长外套',value:28},
                    {id:209,name:'牛仔外套',value:29}
                ]},
                {id:3,name:'下装',list:[
                    {id:300,name:'速干运动短裤',value:30},
                    {id:301,name:'速干运动长裤',value:31},
                    {id:302,name:'棉质运动短裤',value:32},
                    {id:303,name:'棉质运动长裤',value:33},
                    {id:304,name:'半身裙',value:34},
                    {id:305,name:'连衣裙',value:35},
                    {id:306,name:'牛仔短裤',value:36},
                    {id:307,name:'牛仔长裤',value:37},
                    {id:308,name:'西裤',value:38},
                    {id:309,name:'棉质打底裤',value:39},
                    {id:310,name:'Polo衫',value:40},
                ]},
                {id:4,name:'毛巾',list:[
                    {id:400,name:'婴儿口水巾',value:40},
                    {id:401,name:'棉质方巾',value:41},
                    {id:402,name:'长毛巾',value:42},
                    {id:403,name:'擦头巾',value:43},
                    {id:404,name:'浴巾',value:44},
                ]},
                {id:5,name:'袜子',list:[
                    {id:500,name:'棉质船袜',value:50},
                    {id:501,name:'棉质短袜',value:51},
                    {id:502,name:'棉质长袜',value:52},
                    {id:503,name:'居家地板袜',value:53},
                    {id:504,name:'浴巾',value:54},
                ]},
                {id:6,name:'其他',list:[
                    {id:600,name:'保暖护腰',value:60},
                    {id:601,name:'加棉护膝',value:61},
                    {id:602,name:'薄护膝',value:62},
                    {id:603,name:'枕套',value:63},
                    {id:604,name:'帽子',value:64},
                    {id:604,name:'书包',value:65},
                    {id:604,name:'毛绒玩具',value:66},
                ]}
            ],
            defaultIndexs: [1, 0], // 指定选择每一级的第几项，可以不填不传，默认为0(第一项)
            visible: true,
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
                    title='干衣时间'
                    style={{ backgroundColor: '#fff' }}
                    onPressLeft={_ => {
                        navigation.goBack();
                    }}
                />
        };
    };
    componentDidMount() {
        this.selectData();
        this.setState({visMessage:true});
    }
    confirmProps =()=>{
        // this.props.navigation.goBack();
        DeviceEventEmitter.emit("EventType", param);
    };
    updateOneValue = (data)=>{
        alert(JSON.stringify(data));
        this.setState({
            param:data.newValue,
            defaultClass:data.newValue,
        });

    };
    selectData =()=>{
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
        // alert(JSON.stringify(classList));
        // alert(JSON.stringify(valueList));
    };
    onChange(arr) { // 选中项改变时触发, arr为当前每一级选中项索引，如选中B和Y，此时的arr就等于[1,1]
        console.log(arr)
    }
    onOk(arr) { // 最终确认时触发，arr同上
        console.log(arr)
    }
    render(){
        return (
            <View style={{flex: 1,justifyContent: 'center',alignContent: 'center',backgroundColor:'#0e62bd'}}>
                <View style={{ flexDirection: 'row' ,flex:1,justifyContent: 'center',alignContent: 'center',}}>

                    <StringSpinner
                        style={{ width: 120, height: 200, marginLeft: 10,backgroundColor: 'transparent', }}
                        dataSource={this.state.classList}
                        defaultValue={this.state.defaultClass}
                        pickerInnerStyle={{ lineColor: "rgba(255,255,255,.8)", selectTextColor: "#ffffff", fontSize: 18, selectFontSize: 18, rowHeight: 40 }}
                        onValueChanged={(data) => { this.updateOneValue(data) }}
                    />

                    <StringSpinner
                        style={{ width: 120, height: 200, marginRight: 10,backgroundColor: 'transparent', }}
                        dataSource={this.state.valueList}
                        defaultValue={this.state.defaultValue}
                        // unit={"斤"}
                        pickerInnerStyle={{ lineColor: "rgba(255,255,255,.8)", selectTextColor: "#ffffff", fontSize: 18, selectFontSize: 18, rowHeight: 40 }}
                        onValueChanged={(data) => { this.updateOneValue(data) }}
                    />
                </View>
                <View style={style.butBox}>
                    <TouchableOpacity style={[style.butIcon,{backgroundColor:this.state.status ? 'rgba(255,255,255,.30000000000000)' : 'transparent'}]} onPress={this.confirmProps()} >
                        <Image source={ this.state.statusImg } />
                    </TouchableOpacity>
                </View>
                <MessageDialog title={'提示'}
                               message={'1.请确保衣物间留有一定空隙；\n2.根据最厚的一件衣物，来选择相应时间吧。'}
                               cancelable={true}
                    // cancel={'取消'}
                               confirm={'我知道了'}
                               // timeout={10000}
                               onCancel={(e) => {
                                   console.log('onCancel', e);
                               }}
                               onConfirm={(e) => {}}
                               onDismiss={() => {
                                   console.log('onDismiss');
                                   this.setState({ visMessage: false });
                               }}
                               visible={this.state.visMessage} />
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