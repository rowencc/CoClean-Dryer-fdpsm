
    import React from 'react';
    import { API_LEVEL, Package, Device, Service, Host } from 'miot';
    import { PackageEvent, DeviceEvent } from 'miot';
    import TitleBar from "miot/ui/TitleBar";
    import { Image, ListView, PixelRatio, StyleSheet, Text, TouchableHighlight, View } from 'react-native';

    class App extends React.Component {
        static navigationOptions = ({ navigation }) => {
            return {
                header:
                    <View>
                        <TitleBar
                            type='dark'
                            title={navigation.state["params"] ? navigation.state.params.name : 'hello world'}
                            subTitle={getString('NUM_PHOTOS', { 'numPhotos': 1 })}
                            onPressLeft={() => { Package.exit() }}
                            onPressRight={() => {
                                navigation.navigate('Setting', { 'title': '设置' });
                            }} />
                    </View>
            };
        };
        render() {
            return (
            <View style={{ backgroundColor: 'powderblue' }}>
                <TitleBar
                    type='dark'
                    title='清蜓智能便携衣物烘干机'
                    subTitle=''
                    onPressLeft={() => { Package.exit() }}
                    onPressRight={() => {
                        navigation.navigate('Setting', { 'title': '设置' });
                    }} />
            <Text>hello, this is a tiny plugin project of MIOT</Text>
            <Text>API_LEVEL:{API_LEVEL}</Text>
            <Text>NATIVE_API_LEVEL:{Host.apiLevel}</Text>
            <Text>{Package.packageName}</Text>
            <Text>models:{Package.models}</Text>
            </View>
            )
        }
    }
    Package.entry(App, () => {

    })
