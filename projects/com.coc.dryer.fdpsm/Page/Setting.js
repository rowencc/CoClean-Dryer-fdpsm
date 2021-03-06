'use strict';


import { strings, Styles } from 'miot/resources';
import { CommonSetting, SETTING_KEYS } from "miot/ui/CommonSetting";
import { secondAllOptions } from "miot/ui/CommonSetting/CommonSetting";
import { ListItem, ListItemWithSlider, ListItemWithSwitch } from 'miot/ui/ListItem';
import Separator from 'miot/ui/Separator';
import NavigationBar from "miot/ui/NavigationBar";
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_LEVEL, Package, Device, Service, Host } from 'miot';

const { first_options, second_options } = SETTING_KEYS;

export default class Setting extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            header:
                <NavigationBar
                    title={strings.setting}
                    backgroundColor='#fff'
                    // type={NavigationBar.TYPE.DARK}
                    left={[
                        {
                            key: NavigationBar.ICON.BACK,
                            onPress: () => {navigation.goBack()}
                        }
                    ]}
                    onPressTitle={() => {console.log('onPressTitle')}}
                />
        };
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            sliderValue: 25,
            switchValue: false,
            name: Device.name,
            showDot: [],
        }
    }

    render() {
        // 显示部分一级菜单项
        const firstOptions = [
            first_options.SHARE,
            // first_options.IFTTT,
            // first_options.VOICE_AUTH,
            // first_options.FIRMWARE_UPGRADE,
        ]
        // 显示部分二级菜单项
        const secondOptions = [
            second_options.AUTO_UPGRADE,
            second_options.TIMEZONE,
        ]
        // 显示固件升级二级菜单
        const extraOptions = {
            showUpgrade: true,
            upgradePageKey: 'FirmwareUpgrade',
            // licenseUrl: require('../Resources/html/license_zh.html'),
            // policyUrl: require('../Resources/html/privacy_zh.html'),
            deleteDeviceMessage: '真的要删除？你不再考虑考虑？',
            excludeRequiredOptions: [secondAllOptions.SECURITY]
        }
        return (
            <View style={styles.container}>
                <Separator />
                <ScrollView
                    showsVerticalScrollIndicator={false}>
                    {/*<View style={[styles.blank, { borderTopWidth: 0 }]} />*/}
                    {/*<View style={styles.featureSetting}>*/}
                        {/*<View style={styles.titleContainer}>*/}
                        {/*    <Text style={styles.title}>{strings.featureSetting}</Text>*/}
                        {/*</View>*/}
                        {/*<Separator style={{ marginLeft: Styles.common.padding }} />*/}
                        {/*<ListItem*/}
                        {/*    title= {this.state.name}*/}
                        {/*    showDot={this.state.showDot}*/}
                        {/*    onPress={_ => console.log(0)}*/}
                        {/*/>*/}
                        {/*<ListItemWithSwitch*/}
                        {/*    title='三个'*/}
                        {/*    value={this.state.switchValue}*/}
                        {/*    onValueChange={value => this.onValueChange(value)}*/}
                        {/*/>*/}
                        {/*<ListItemWithSlider*/}
                        {/*    title='测试'*/}
                        {/*    showWithPercent={false}*/}
                        {/*    unit={'cal'}*/}
                        {/*    sliderProps={{ value: this.state.sliderValue }}*/}
                        {/*    onSlidingComplete={value => this.onSlidingComplete(value)}*/}
                        {/*    onValueChange={value => console.log(value)}*/}
                        {/*    showSeparator={false}*/}
                        {/*/>*/}
                    {/*</View>*/}
                    {/*<View style={styles.blank} />*/}
                    <CommonSetting
                        navigation={this.props.navigation}
                        firstOptions={firstOptions}
                        // showDot={this.state.showDot}
                        secondOptions={secondOptions}
                        extraOptions={extraOptions}
                    />
                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        );
    }

    onValueChange(value) {
        console.log(value);
    }

    onSlidingComplete(value) {
        console.log(value);
    }

    componentDidMount() {
        // TODO: 拉取功能设置项里面的初始值，比如开关状态，slider的value
        setTimeout(_ => this.setState({
            switchValue: true,
            sliderValue: 75,
            showDot: [
                first_options.FIRMWARE_UPGRADE
            ]
        }), 2000);
    }
}

var styles = StyleSheet.create({
    container: {
        backgroundColor: Styles.common.backgroundColor,
        flex: 1,
    },
    featureSetting: {
        backgroundColor: '#fff',
    },
    blank: {
        height: 8,
        backgroundColor: Styles.common.backgroundColor,
        borderTopColor: Styles.common.hairlineColor,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Styles.common.hairlineColor,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    titleContainer: {
        height: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingLeft: Styles.common.padding,
    },
    title: {
        fontSize: 11,
        color: 'rgba(0,0,0,0.5)',
        lineHeight: 14,
    }
});