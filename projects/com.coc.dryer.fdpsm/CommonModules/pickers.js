import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
    StyleSheet,
    View,
    Text,
    Picker,
    TouchableOpacity,
} from 'react-native'

// 单个选项
class PickerItem extends Component {
    static propTypes = {
        list: PropTypes.array,
        onChange: PropTypes.func,
        defaultIndex: PropTypes.number,
    }

    static getDerivedStateFromProps(nextProps, prevState) { // list选项列表和defaultIndex变化之后重新渲染
        if (nextProps.list !== prevState.list ||
            nextProps.defaultIndex !== prevState.defaultIndex) {
            return {
                list: nextProps.list,
                index: nextProps.defaultIndex
            }
        }
        return null
    }

    constructor (props) {
        super(props)
        this.state = {
            list: props.list,
            index: props.defaultIndex
        }
        this.onValueChange = this.onValueChange.bind(this)
    }

    onValueChange (itemValue, itemIndex) {
        this.setState( // setState不是立即渲染
            {
                index: itemIndex
            },
            () => {
                this.props.onChange && this.props.onChange(itemIndex)
            })

    }

    render() {
        // Picker的接口直接看react native的文档https://reactnative.cn/docs/picker/
        const { list = [], index = 0 } = this.state
        const value = list[index]
        const Items = list.map((obj, index) => {
            return <Picker.Item key={index} label={obj.label} value={obj} />
        })
        return (
            <Picker
                selectedValue={value}
                style={{ flex: 1 }}
                mode="dropdown"
                onValueChange={this.onValueChange}>
                {Items}
            </Picker>
        )
    }
}

// Modal 安卓上无法返回
class Pickers extends Component {
    static propTypes = {
        options: PropTypes.array,
        defaultIndexs: PropTypes.array,
        onClose: PropTypes.func,
        onChange: PropTypes.func,
        onOk: PropTypes.func,
    }
    static getDerivedStateFromProps(nextProps, prevState) { // options数据选项或指定项变化时重新渲染
        if (nextProps.options !== prevState.options ||
            nextProps.defaultIndexs !== prevState.defaultIndexs) {
            return {
                options: nextProps.options,
                indexs: nextProps.defaultIndexs
            }
        }
        return null
    }
    constructor (props) {
        super(props)
        this.state = {
            options: props.options, // 选项数据
            indexs: props.defaultIndexs || [] // 当前选择的是每一级的每一项，如[1, 0]，第一级的第2项，第二级的第一项
        }
        this.close = this.close.bind(this) // 指定this
        this.ok = this.ok.bind(this) // 指定this
    }
    close () { // 取消按钮事件
        this.props.onClose && this.props.onClose()
    }

    ok () { // 确认按钮事件
        this.props.onOk && this.props.onOk(this.state.indexs)
    }
    onChange (itemIndex, currentIndex) { // itemIndex选中的是第几项，currentIndex第几级发生了变化
        const indexArr = []
        const { options = [], indexs = [] } = this.state
        const re = (arr, index) => { // index为第几层,循环每一级
            if (arr && arr.length > 0) {
                let childIndex
                if (index < currentIndex) { // 当前级小于发生变化的层级, 选中项还是之前的项
                    childIndex = indexs[index] || 0
                } else if (index === currentIndex) { // 当前级等于发生变化的层级, 选中项是传来的itemIndex
                    childIndex = itemIndex
                } else { // 当前级大于发生变化的层级, 选中项应该置为默认0，因为下级的选项会随着上级的变化而变化
                    childIndex = 0
                }
                indexArr[index] = childIndex
                if (arr[childIndex] && arr[childIndex].children) {
                    const nextIndex = index + 1
                    re(arr[childIndex].children, nextIndex)
                }
            }
        }
        re(options, 0)
        this.setState(
            {
                indexs: indexArr // 重置所有选中项，重新渲染
            },
            () => {
                this.props.onChange && this.props.onChange(indexArr)
            }
        )
    }
    renderItems () { // 拼装选择项组
        const items = []
        const { options = [], indexs = [] } = this.state
        const re = (arr, index) => { // index为第几级
            if (arr && arr.length > 0) {
                const childIndex = indexs[index] || 0 // 当前级指定选中第几项,默认为第一项
                items.push({
                    defaultIndex: childIndex,
                    values: arr //当前级的选项列表
                })
                if (arr[childIndex] && arr[childIndex].children) {
                    const nextIndex = index + 1
                    re(arr[childIndex].children, nextIndex)
                }
            }
        }
        re(options, 0) // re为一个递归函数
        return items.map((obj, index) => {
            return ( // PickerItem为单个选择项,list为选项列表，defaultIndex为指定选择第几项，onChange选中选项改变时回调函数
                <PickerItem
                    key={index.toString()}
                    list={obj.values}
                    defaultIndex={obj.defaultIndex}
                    onChange={(itemIndex) => { this.onChange(itemIndex, index)}}
                />
            )
        })
    }

    render() {
        return (
            <View
                style={styles.box}>
                <TouchableOpacity
                    onPress={this.close}
                    style={styles.bg}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.dialogBox}>
                        <View style={styles.pickerBox}>
                            {this.renderItems()}
                        </View>
                        <View style={styles.btnBox}>
                            <TouchableOpacity
                                onPress={this.close}
                                style={styles.cancelBtn}>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode={"tail"}
                                    style={styles.cancelBtnText}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={this.ok}
                                style={styles.okBtn}>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode={"tail"}
                                    style={styles.okBtnText}>确认</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    bg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dialogBox: {
        width: 260,
        flexDirection: "column",
        backgroundColor: '#fff',
    },
    pickerBox: {
        flexDirection: "row",
    },
    btnBox: {
        flexDirection: "row",
        height: 45,
    },
    cancelBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#4A90E2',
        borderWidth: 1,
    },
    cancelBtnText: {
        fontSize: 15,
        color: '#4A90E2'
    },
    okBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
    },
    okBtnText: {
        fontSize: 15,
        color: '#fff'
    },
})

export default Pickers