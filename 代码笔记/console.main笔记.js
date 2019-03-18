define(function (require, exports, module) {
  // 加载模块数据
  var config = require('config')
  var util = require('util')
  window.login = config.login
  console.log(config.login)
  // ？？？
  $.request({
    url: '/moduleswitch/api/ListModuleSwitch',
    async: false,
    done: function (data) {
      if (data.stat === 'OK') {
        window.moduleswitch = data.moduleswitch
      }
    }
  })
  // 全局事件对象
  window.AppEvent = $({})
  var Router = window.Backbone.Router.extend({
    routes: {
      // *other可以匹配多种路由
      '*other': function (callback, args) {
        // 返回url地址#后面的字符串
        if (!(window.location.hash.substr(1))) {
          var $node = $('.nav-wrap').find('.nav-item:eq(0)')
          $node.click()
          if ($node.next('.nav-child').length) {
            $node.next('.nav-child').find('.nav-item:eq(0)').click()
          }
        } else {
          $.alert('您要访问的路径不存在！')
          $('.body-center').empty()
        }
        return false
      }
    },
    execute: function (callback, args) {
      if ($('#xmenu').length) $('#xmenu').remove()
      if ($('#xmsg').length) $('#xmsg').add($('#msg-mask')).remove()
      if ($('.xdialog').length) $('.xdialog').add($('.xmask')).remove()
      function next () {
        $(document).trigger('click')
        document.title = config.title
        $('.nav-current').removeClass('nav-current')
        if (callback) callback.apply(this, args)
      }
      next()
    // triggerAnchor('saveAndQuite', next, function() {
    //     $('.acl-save').trigger('click', function() {
    //         next()
    //     })
    // })
    }
  })
  // 全局路由对象
  window.AppRouter = new Router()
  // 记录当前位置
  window.current = {}
  // 记录权限
  window.rights = []
  window.roles = []
  // 需要加载的模块
  var modules

  // $.when提供一个方法来执行多个对象的回调函数
  $.when($.request({
    url: '/role/api/listRole'
  }), $.request({
    url: '/conf/api/getServerConf'
  }), $.request({
    url: '/conf/api/getConf',
    data: {
      confs: [{
        module: 'group',
        key: 'openGroup'
      }, {
        module: 'dept',
        key: 'displayOrgStructure'
      }]
    }
  }), $.request({
    url: '/user/api/getUserInfo'
  })).done(function (data, serverConfig, confs, user) {
    console.log(data)
    console.log(serverConfig)
    console.log(confs)
    console.log(user)
    if (serverConfig.stat === 'OK') {
      console.log(serverConfig.modules)
      window.serverConfig = serverConfig.modules
      // 18000
      window.serverConfig.version = serverConfig.version
    }
    // 判断mode属性是saas还是private
    if (window.serverConfig && window.serverConfig.saas && window.serverConfig.saas.enable) {
      window.serverConfig.mode = 'saas'
    } else if (window.serverConfig && window.serverConfig.saas && !window.serverConfig.saas.enable) {
      window.serverConfig.mode = 'private'
    } else {
      // 兼容
      window.serverConfig.mode = config.mode
    }
    // 需要加载的模块
    // config.modules.console是一个对象数据
    // window.serverConfig.mode是saas或者private
    // 选中属性值为saas或者private的对象数据 此时为private
    console.log(window.serverConfig.mode)
    modules = config.modules.console[window.serverConfig.mode]
    // 已经有overview了
    console.log(modules)
    if (confs.stat === 'OK') {
      window.conf = {}
      $.each(confs.rows, function (i, v) {
        // 给window.conf对象中加入属性名为openGroup和displayOrgStruture的数据
        // 值为true或者false
        window.conf[v.key] = v.value
      })
    }
    if (user.stat === 'OK') {
      window.userinfo = user.user
    }
    // 如果roles不为空且不为license的普通用户
    // util.checkLicense(data) 如果是license 返回true 否则返回false
    if (data.stat === 'OK' && data.rows.length && !util.checkLicense(data)) {
      // 当不是license时，需要加载helper,init,deptuser模块
      var module = ['helper', './init', './deptuser']
      // 遍历rows
      $.each(data.rows, function (i, v) {
        // 给window.rows数组添加data.rows.role.name数据
        // 此时是serverAdmin 和 groupadmin
        window.roles.push(v.role.name)
        if (v.role.hasOwnProperty('rights')) {
          // 如果data.rows.roles有rights 遍历rights
          $.each(v.role.rights, function (m, n) {
            // 给module加上模块 rights.module 的值，
            // 可能有role user dept group quota ...等模块
            module.push('./' + n.module)
            // name 可能为RIGHT_CHECK_GROUP ...等
            window.rights.push(n.name)
          })
        }
        // 如果此时遍历的是data.rows的最后一个数据
        if (i === data.rows.length - 1) {
          // 如果93行判断 此时serverConfig.mode 为sass时
          if (window.serverConfig.mode === 'saas') {
            // 如果126行windows.roles里有serveradmin
            if (_.indexOf(window.roles, 'serverAdmin') > -1) {
              // 选中属性名为saas或者private的数据下的serverAdmin
              modules = config.modules.console[window.serverConfig.mode].serverAdmin
              // 否则选中conpanyAdmin
            } else if (_.indexOf(window.roles, 'companyAdmin') > -1) {
              modules = config.modules.console[window.serverConfig.mode].companyAdmin
            }
          }
        }
      })
      var init = function () {
        // underscore数组去重方法
        module = _.uniq(module)
        window.rights = _.uniq(window.rights)
        // console.log(window.serverConfig.mode, window.roles, 'serverAdmin')
        // 如果serverConfig.mode为private 并且 window.roles 里没有serverAdmin
        if (window.serverConfig.mode === 'private' && _.indexOf(window.roles, 'serverAdmin') < 0) {
          // 判定配置文件里面是否有dks自定义模块
          if (config.plugins.hasOwnProperty('dks')) {
            var dksRoles = config.plugins.dks.dksRoles
            window.roles = _.intersection(dksRoles, window.roles)
            $.each(config.plugins.dks[window.roles[0]], function (i, v) {
              config.plugins.console.push(v)
            })
          }
          // 取数据的交集 区modules和module都包含的模块
          modules = _.intersection(modules, module)
        }
        // 如果此时serverConfig.mode为saas并且window.roles中不存在companyAdmin
        if (window.serverConfig.mode === 'saas' && _.indexOf(window.roles, 'companyAdmin') === -1) {
          modules = module
          // pop()删除并返回数组的最后一个元素
          modules.pop()
        }
        var plugins = config.plugins.console
        // 遍历config.js中的plugins数据 是一个数组
        // ？？？
        $.each(plugins, function (i, v) {
          if (v.split('/').length > 1) {
            plugins[i] = '../../plugins/' + v
          } else {
            plugins[i] = '../../plugins/' + v + '/index'
          }
        })
        // underscore的多个数组联合起来去重后返回一个数组的方法
        modules = _.union(modules, config.modules.view, plugins)
        // seajs中的异步回调执行加载模块 且文件加载完成后立即执行
        require.async(modules, function () {
          // 模块加载完成之后执行各模块初始化
          // arguments 表示遍历的每一个模块
          $.each(arguments, function (i, v) {
            // 如果此时这个模块是对象并且
            if (typeof (v) === 'object' && v.hasOwnProperty('initialize')) {
              v.initialize()
              // console.log(arguments)
            }
          })
          // 启动路由监听
          // 可以记录你的跳转过程，历史url
          window.Backbone.history.start()
        })
      }
      // 如果在module中没有./audit这个模块
      if (_.indexOf(module, './audit') < 0) {
        $.request({
          url: '/group/api/getGroupRoleRight',
          done: function (data) {
            if (data.stat === 'OK') {
              if (data.isRootGroupManager) {
                window.hasGroupManager = data.isRootGroupManager
                // 如果是private 给module加上audit模块
                if (window.serverConfig.mode === 'private') {
                  module.push('./audit')
                }
                // 否则给module加上group模块
                module.push('./group')
              }
            }
            // 如果data.stat ===false 调用init()
            init()
          }
        })
      } else {
        // 如果有audit模块 调用init()
        init()
      }
      console.log(modules)
    } else {
      // 如果roles为空或者是license的普通用户
      $.request({
        url: '/conf/api/getConf',
        params: {
          confs: [{
            module: 'group',
            key: 'openGroup'
          }]
        },
        done: function (data) {
          if (data.stat === 'OK') {
            if (data.rows[0].value === 'true') {
              require.async(['helper', './init', './group', './audit'], function () {
                $.each(arguments, function (i, v) {
                  if (v.hasOwnProperty('initialize')) v.initialize()
                })
                window.Backbone.history.start()
              })
            } else {
              $.request({
                url: '/group/api/getGroupRoleRight',
                done: function (data) {
                  if (data.stat === 'OK') {
                    if (data.isRootGroupManager && window.serverConfig.mode === 'private') {
                      window.hasGroupManager = data.isRootGroupManager
                      modules = ['helper', './init', './group', './audit']
                    } else {
                      modules = ['helper', './init', './group']
                    }
                    // config.plugins.console是一个数组数据 把它赋给plugins
                    var plugins = config.plugins.console
                    // 遍历plugins
                    $.each(plugins, function (i, v) {
                      if (v.split('/').length > 1) {
                        plugins[i] = '../../plugins/' + v
                      } else {
                        plugins[i] = '../../plugins/' + v + '/index'
                      }
                    })
                    modules = _.union(plugins, modules, config.modules.view)
                    // 异步加载模块，并且一加载完毕就执行回调函数
                    require.async(modules, function () {
                      // 遍历每一个模块  如果模块中有initialize属性的，就立即执行
                      $.each(arguments, function (i, v) {
                        if (v.hasOwnProperty('initialize')) v.initialize()
                      })
                      window.Backbone.history.start()
                    })
                  } else {
                    // 如果data.stat不为ok则直接跳转index.html
                    window.location.href = 'index.html'
                  }
                }
              })
            }
          }
        }
      })
    }
  })
  function setAnchor (name, fun) {
    AppEvent.on('console.set.anchor.' + name, fun)
  }
  function triggerAnchor (name) {
    var args = Array.prototype.slice.apply(arguments)
    args.shift()
    AppEvent.trigger('console.set.anchor.' + name, args)
  }
  module.exports = {
    // 更新系统设置项
    updateConf: function () {
      $.request({
        url: '/conf/api/getConf',
        data: {
          confs: [{
            module: 'group',
            key: 'openGroup'
          }, {
            module: 'dept',
            key: 'displayOrgStructure'
          }]
        }
      }).done(function (data) {
        if (data.stat === 'OK') {
          window.conf = {}
          $.each(data.rows, function (i, v) {
            window.conf[v.key] = v.value
          })
        }
      })
    },
    setAnchor: setAnchor,
    triggerAnchor: triggerAnchor
  }
})
