/**
 * 全局配置文件
 * Created by cyz on 2017/09/13
 */
var properties = require('properties-parser');

var Singleton = (function () {
        var instantiated;

        function init() {
            /*这里定义单例代码*/
            var proper = properties.read("./bin/config/config.properties");
            var _baseFolder = proper['baseFolder'];
            var _dataBase = proper['dataBase'];
            var _mysqlHost = proper['mysqlHost'];
            var _mysqlUser = proper['mysqlUser'];
            var _mysqlPassword = proper['mysqlPassword'];
            var _mysqlDataBase = proper['mysqlDataBase'];
            return {
                baseFolder: _baseFolder,
                dataBase: _dataBase,
                mysqlHost: _mysqlHost,
                mysqlUser: _mysqlUser,
                mysqlPassword: _mysqlPassword,
                mysqlDataBase: _mysqlDataBase
            };
        }

        return {
            getInstance: function () {
                if (!instantiated) {
                    instantiated = init();
                }
                return instantiated;
            }
        };
    })
    ();

exports.Config = Singleton;