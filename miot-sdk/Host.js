/**
 * @export public
 * @doc_name 原生模块
 * @doc_index 1
 * @doc_directory host
 * @module miot/Host
 * @description 
 * 扩展程序运行时的宿主环境  
 * 所有由宿主APP直接提供给扩展程序的接口均列在这里. 主要包括原生业务页面, 本地数据访问等
 *
 * @example
 *
 *  import {Host} from 'miot'
 *
 *  Host.type // ios/ android/ tv
 *  Host.isIOS
 *  Host.isAndroid
 *
 *  Host.version
 *  Host.apiLevel
 *  Host.isDebug
 *
 *
 *  Host.ui.openDeviceListPage()
 *  Host.ui.openShopPage(100)
 *
 *  Host.locale.language
 *  Host.locale.timezone
 *  Host.locale.currentTimeMillis.then(time=>{})
 *  Host.locale.getCurrentCountry().then(country=>{})
 *  Host.locale.getPlaceMark().then(place=>{})
 *  Host.locale.getGPS().then(gps=>{})
 *
 *
 *  Host.file.readFile(path).then(file=>{})
 *  Host.file.writeFile(path, file).then(ok=>{})
 *
 *  Host.storage.get(key)
 *  Host.storage.set(key, value)
 *
 */
import HostAudio from './host/audio';
import HostCrypto from './host/crypto';
import HostFile from './host/file';
import HostLocale from './host/locale';
import HostStorage from './host/storage';
import HostUI from './host/ui';
 const IOS="ios", ANDROID="android";
export const HOST_TYPE_IOS = IOS;
export const HOST_TYPE_ANDROID = ANDROID;
export default {
    /**
     * @const
     * @type {string}
     * @description 返回本地环境的类型, ios|android
     *
     *
     */
    get type() {
         return  "..."
    },
    /**
     * @const 
     * @type {object} 
     * @description 系统信息 包含sysVersion 系统版本名称 mobileModel 手机型号
     */
    get systemInfo() {
         return  {}
    },
    /**
     * @const
     * @type {boolean}
     * @description 判断是否是 android
     */
    get isAndroid() {
         return  false
    },
    /**
     * @const
     * @type {boolean}
     * @description 判断是否 iOS，和上面那个方法二选一即可
     */
    get isIOS() {
         return  false
    },
    /**
     * @const
     * @type string
     * @description APP 的版本, 例如"1.0.0"
     */
    get version() {
         return  ""
    },
    /**
     * @const
     * @type int
     * @description APP 的 apiLevel
     */
    get apiLevel() {
         return  0
    },
    /**
     * 判断是否是调试版本
     * @const
     * @type {boolean}
     * @readonly
     *
     */
    get isDebug() {
         return  true
    },
    /**
     * 是否是国际版APP 国内版1 国际版2 欧洲版3
     * @const
     * @type {int}
     * @readonly
     */
    get applicationEdition() {
         return  true
    },
    /**
     * 获取 米家APP中 我的-->开发者设置-->其他设置，  AppConfig接口拉取preview版数据 是否选中的状态
     * 1:表示选中, preview ； 0：表示未选中, release
     * 如果选中，Service.smarthome.getAppConfig 获取的数据为preview版数据， 反之为release版数据
     * @since 10024
     * @const
     * @type {int}
     * @readonly
     */
    get appConfigEnv() {
       return  true
    },
    /**
     * @const
     * @see {@link module:miot/host/ui}
     * @description 可调起的host业务页面
     *
     */
    get ui() {
        return HostUI;
    },
    /**
     * @const
     * @see {@link module:miot/host/locale}
     * @description host 的本地化设置, 包括语言,地区,城市等等
     */
    get locale() {
        return HostLocale;
    },
    /**
     * 本地数据存储服务模块
     * @const
     * @see {@link module:miot/host/storage}
     *
     */
    get storage() {
        return HostStorage;
    },
    /**
     * 本地文件服务模块
     * @const
     * @see {@link module:miot/host/file}
     */
    get file() {
        return HostFile;
    },
    /**
     * 音频 播放，录制，转码相关模块
     * @const
     * @see {@link module:miot/host/audio}
     */
    get audio() {
        return HostAudio;
    },
    /**
     * 加密解密模块
     * @const
     * @see {@link module:miot/host/crypto}
     */
    get crypto() {
        return HostCrypto;
    },
    /**
     * 获取手机wifi信息
     * @return {Promise}
     * @example
     * Host.getWifiInfo().then(res => console("ssid and bssid = ", res.SSID, res.BSSID))
     */
    getWifiInfo() {
         return Promise.resolve(null);
    },
    /**
     * 获取APP名称
     */
    getAppName() {
         return Promise.resolve(null);
    },
    /**
     * 获取当前登陆用户的服务器国家
     * @since 10010
     * @deprecated 10011 改用 Service.getServerName
     */
    getCurrentCountry() {
         return Promise.resolve(null);
    },
    /**
     * 获取手机运营商信息
     * 返回值中：
     * name 运营商名称-与手机语言一致
     * simOperator 运营商 国家编码(三位)+网络编码 参考 https://en.wikipedia.org/wiki/Mobile_country_code
     * countryCode 运营商国家码，ISO 3166-1 country code
     * @since 10021
     * @returns {Promise} 运营商信息 {'1':{name:'',simOperator:'',,countryCode:''},'2':{...}}
     */
    getOperatorsInfo() {
         return Promise.resolve(null);
    },
    /**
     * jx执行器
     * @typedef IExecutor
     * @since 10002
     * @property {boolean} isReady  - 是否可用
     * @property {boolean} isRunning - 是否运行中 
     * @property {*} execute(method, ...args) - 执行某个函数
     * @property {} remove() - 删除
     *
     */
    /**
     * 后台执行文件, 后台最多同时运行三个线程, 超过将销毁最早创建的 executor
     * @since 10002
     * @param {*} jx - 可执行的纯 js 文件, 不使用任何高级语法, 如要使用 es6, 请自行编译通过.
     * @param {json} initialProps - 用于脚本初始化的数据, 在jx文件中为 'initialProps' 对象，使用方法参考样例 或者sampleProject中 ‘com.xiaomi.demo/Main/tutorial/JSExecutor.js’
     * @returns {Promise<IExecutor>} 
     * @example
     * 
     * var myexecutor = null;
     * Host.createBackgroundExecutor(require('./test.jx'), {name1:"testName"})
     *      .then(executor=>{
     *          myexecutor = executor;
     *          executor.execute("myFunc", 1,2,'a')
     *                  .then(result=>{
     *                      console.log(result);
     *                  })
     *          //支持使用initialProps或者在jx中直接使用
     *          executor.execute("myFunc2", "initialProps.name1").then(res =>{...})
     *          //支持使用obj与arr
     *          executor.execute("SomeObject.myFunc3", {"name":"hello"}, ["a1","a2"]).then(res =>{...})
     * })
     * .then(err=>{...})
     * ....
     * myexecutor&&myexecutor.remove();
     */
    createBackgroundExecutor(jx, initialProps = {}) {
         return Promise.resolve({execute(method, ...args){}, remove(){}});
    },
    /**
     * android 手机是否有NFC功能
     * @since 10021
     * @return {Promise}
     * @example
     * Host.phoneHasNfcForAndroid().then(res => console(res))
     */
    phoneHasNfcForAndroid() {
         return Promise.resolve(null);
    },
}