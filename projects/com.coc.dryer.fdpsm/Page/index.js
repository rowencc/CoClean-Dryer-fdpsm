'use strict';

import TitleBar from "miot/ui/TitleBar";
import React from 'react';
import { createStackNavigator,goback } from 'react-navigation'; //
import MainPages from './MainPage';
import { FirmwareUpgrade, MoreSetting } from "miot/ui/CommonSetting";
import Setting from "./Setting";
import RpcControl from './RpcControl';
import Selects from './Select';
import { API_LEVEL, Package, Device, Service, Host } from 'miot';

const imagePathMap = new Map();
let onPressShare = () => {
    let imageName = "share_" + new Date().getTime() + ".png";
    Host.file.screenShot(imageName).then((imagePath) => {imagePathMap.set(imageName, imagePath);
            Host.ui.openShareListBar(Device.name, Device.name+'分享描述', {uri:imagePath}, '')
        }).catch((result) => {});
};
const RootStack = createStackNavigator({
        Home: MainPages,
        Setting,
        MoreSetting,
        FirmwareUpgrade,
        RpcControl,
        Selects,
    },
    {
        // ThirdPartyDemo
        initialRouteName: 'Home',
        // initialRouteName: 'ModeCardDemo',
        navigationOptions: ({ navigation }) => {
            return {
                header:
                    <TitleBar
                        // type='dark'
                        title={navigation.state.params ? navigation.state.params.title : Device.name}
                        subTitle=''
                        style={{backgroundColor:'#0e62bd'}}
                        onPressLeft={() => {
                            Package.exit();
                            // if (this.props.navigation.routeName == 'MainPage') {
                            //     Package.exit();
                            // }else{
                            //     navigation.goBack();
                            // }
                        }}
                        onPressLeft2={() => {
                            navigation.navigate('RpcControl', { 'title': '设备控制' });
                        }}
                        onPressRight={() => {
                            navigation.navigate('Setting', { 'title': '设置' });
                        }}
                        onPressRight2={() => {
                            onPressShare();
                            // navigation.navigate('MoreSetting', { 'title': '设置' });
                        }}
                    />
            };
        },
        transitionConfig: () => ({
            screenInterpolator: interpolator,
        }),
    });
function interpolator(props) {
    const { layout, position, scene } = props;

    if (!layout.isMeasured) {
        return (props) => {
            const { navigation, scene } = props;

            const focused = navigation.state.index === scene.index;
            const opacity = focused ? 1 : 0;
            // If not focused, move the scene far away.
            const translate = focused ? 0 : 1000000;
            return {
                opacity,
                transform: [{ translateX: translate }, { translateY: translate }],
            };
        };
    }
    const interpolate = (props) => {
        const { scene, scenes } = props;
        const index = scene.index;
        const lastSceneIndexInScenes = scenes.length - 1;
        const isBack = !scenes[lastSceneIndexInScenes].isActive;

        if (isBack) {
            const currentSceneIndexInScenes = scenes.findIndex(item => item === scene);
            const targetSceneIndexInScenes = scenes.findIndex(item => item.isActive);
            const targetSceneIndex = scenes[targetSceneIndexInScenes].index;
            const lastSceneIndex = scenes[lastSceneIndexInScenes].index;

            if (
                index !== targetSceneIndex &&
                currentSceneIndexInScenes === lastSceneIndexInScenes
            ) {
                return {
                    first: Math.min(targetSceneIndex, index - 1),
                    last: index + 1,
                };
            } else if (
                index === targetSceneIndex &&
                currentSceneIndexInScenes === targetSceneIndexInScenes
            ) {
                return {
                    first: index - 1,
                    last: Math.max(lastSceneIndex, index + 1),
                };
            } else if (
                index === targetSceneIndex ||
                currentSceneIndexInScenes > targetSceneIndexInScenes
            ) {
                return null;
            } else {
                return { first: index - 1, last: index + 1 };
            }
        } else {
            return { first: index - 1, last: index + 1 };
        }
    };

    if (!interpolate) return { opacity: 0 };
    const p = interpolate(props);
    if (!p) return;
    const { first, last } = p
    const index = scene.index;
    const opacity = position.interpolate({
        inputRange: [first, first + 0.01, index, last - 0.01, last],
        outputRange: [0, 1, 1, 0.85, 0],
    });

    const width = layout.initWidth;
    const translateX = position.interpolate({
        inputRange: [first, index, last],
        outputRange: false ? [-width, 0, width * 0.3] : [width, 0, width * -0.3],
    });
    const translateY = 0;

    return {
        opacity,
        transform: [{ translateX }, { translateY }],
    };
};

export default class App extends React.Component {
    render() {
        return <RootStack />;
    }

}
