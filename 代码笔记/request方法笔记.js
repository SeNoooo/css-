;(function ($) {
  // 用于设置ajax的全局默认设置
  $.ajaxSetup({
    // 在发送请求之前的回调函数
    beforeSend: function (xhr, options) {
      if (options.global !== false) $(document).trigger('beforeSend', options)
    }
  })
  // 语言包
  var i18n = {
    'zh': {
      'error.network': '网络错误'
    },
    'en': {
      'error.network': 'Network Error'
    }
  }
  var lang = 'zh'
  if (window.language && window.language.substr(0, 2) !== 'zh') {
    lang = 'en'
  }
  var checkUrl, checkParams, now = new Date()
  // 在请求开始时，记录此时的时间
  $.request = function (opt) {
    // 延迟对象 例如：ajax本身就是一个延迟对象
    // 例如$.when()中的参数必须是一个延迟对象
    var dtd = $.Deferred()
    // 把两个对象合并 如果有重复的属性，那么以后一个对象的值为准
    opt = $.extend({ isCheck: true }, opt)
    // 此时如果opt.ischeck为true
    if (opt.isCheck) {
      // ？？？？？isEqual有什么作用
      var isEqual = true
      // 如果此时的时间减去开始前的时间小于500ms
      if (new Date() - now < 500) {
        if (checkUrl !== opt.url) isEqual = false
        if (isEqual && typeof opt.params === 'object' && typeof checkParams === 'object') {
          // eq()函数在下面定义了，判断两个对象是否相等
          // 如果checkParams 和 opt.params不相等
          if (!eq(checkParams, opt.params)) isEqual = false
        }
        if (isEqual) {
          // 当dtd.reject() 意味着任何通过.then() 或者 .fail() 添加的失败回调函数都会被调用 回调函数的执行顺序和他们定义的顺序是一样的，传入给reject()的参数回传给每一个被调用的回调函数
          // 如果isEqual为true 则改变对象状态为已失败，返回fail回调函数
          return dtd.reject() // 相等返回reject
        } else {
          // 不相等就保存一份新的
          now = new Date()
          checkUrl = opt.url
          checkParams = opt.params
        }
      } else {
        // 如果开始时间距离现在大于500ms了
        now = new Date()
        checkUrl = opt.url
        checkParams = opt.params
      }
    }
    // 发送请求默认参数
    var defaults = {
      url: null,
      type: 'post',
      dataType: 'json',
      params: {},
      data: {},
      done: null,
      fail: null,
      always: null,
      async: true,
      json: true,
      checkLogin: true,
      headers: {
        'X-Device': 'Web',
        'X-Language': lang
      }
    }
    // 如果opt.url存在，并且opt.url字符串中含有? 也就是带了参数
    if (opt.url && opt.url.indexOf('?') !== -1) {
      // 截取？之后的参数部分
      var str = opt.url.substr(opt.url.indexOf('?') + 1)
      // 如带有多个参数，按照&分割开来
      strs = str.split('&')
      // 遍历所有的参数
      for (var i = 0; i < strs.length; i++) {
        // 兼容，传过来的 token 被`lp`属性取代，同时`token`值被 base64 加密
        // 如果此时参数属性为token 或者为Lp
        if (strs[i].split('=')[0] === 'token' || strs[i].split('=')[0] === 'lp') {
          if (strs[i].split('=')[0] === 'lp') {
            // base64 解码
            // atob()用来解码base64
            defaults.data.token = atob(strs[i].split('=')[1])
          } else {
            defaults.data.token = strs[i].split('=')[1]
          }
        }
      }
    }
    // 如果存在opt.params 那么params为opt.params 否则params为opt.data
    var params = opt.params || opt.data
    if (!params) params = {}
    // 如果params为不存在token 并且 cookie中也不存在token
    if (!params.token && document.cookie.indexOf('token') < 0) {
      // 在url中查找查询字符串
      var url = window.location.search
      // 如果url存在，并且url字符串中有？
      if (url && url.indexOf('?') !== -1) {
        var str = url.substr(url.indexOf('?') + 1)
        strs = str.split('&')
        for (var i = 0; i < strs.length; i++) {
          if (strs[i].split('=')[0] === 'token' || strs[i].split('=')[0] === 'lp') {
            // 兼容，传过来的 token 被`lp`属性取代，同时`token`值被 base64 加密
            if (strs[i].split('=')[0] === 'lp') {
              // base64 解码
              params.token = atob(strs[i].split('=')[1])
            } else {
              params.token = strs[i].split('=')[1]
            }
          }
        }
      }
    }
    // 合并default和opt这两个对象，其中相同的两个属性值以opt的值为准
    opt = $.extend(defaults, opt)
    var isValid = true
    var checkFun = checkObj(function (v) {
      // 如果传入的参数v是一个字符串，并且字符串中有？？
      if (typeof (v) === 'string' && v.indexOf('??') > -1) {
        return false
      } else if (typeof (v) === 'object') {
        // 如果传入的参数v是object
        return checkFun(v)
      }
    })
    if (typeof params === 'object') {
      isValid = checkFun(params)
    }

    if (isValid === false) {
      $.alert('包含非法字符串“??”')
      return false
    }
    // 如果opt.json存在并且opt.type转为小写为post
    if (opt.json && opt.type.toLowerCase() === 'post') {
      // 把params转为JSON格式
      params = JSON.stringify(params)
      opt.headers['Content-Type'] = 'application/json; charset=UTF-8'
    }
    opt.data = params
    // 发送ajax请求
    $.ajax(opt)
    // 请求成功后
      .done(function (data) {
        // 如果允许接收的类型是json 返回的daata是string 那么使用$.parseJSON(data)
        // 将data转为json类型
        if (opt.dataType === 'json' && typeof (data) === 'string') data = $.parseJSON(data)
        // 如果opt中checkLogin为true并且返回来的data中stat为'ERR_TOKEN_EXPIRED'
        if (opt.checkLogin === true && data.stat === 'ERR_TOKEN_EXPIRED') {
          window.location.href = window.login ? window.login : 'login.html'
          return false
        }
        // 如果opt中checkLogin为true并且返回来的data中stat为'ERR_TOKEN_NOT_FOUND'
        if (opt.checkLogin === true && data.stat === 'ERR_TOKEN_NOT_FOUND') {
          // 如果window.location.href=window.login
          window.location.href = window.login ? window.login : 'login.html'
          return false
        }
        // 检测用户。防止开启两个窗口登录不同帐户导致的异常
        if (opt.checkLogin === true && data.stat === 'OK') {
          // 此函数在下面代码中定义
          var cookie = getCookie()
          // 如果存在cookie.token
          if (cookie.token) {
            var token = cookie.token
            // 截取@后面的字符串
            var tempArr = token.split('@')
            // window.userinfo   window.userinfo.uid ???
            if (tempArr.length > 0 && window.userinfo && window.userinfo.uid) {
              // 选中tempArr数组中的最后一个元素赋值给uid
              var uid = tempArr[tempArr.length - 1]
              // 如果从cookie中截取的uid和window.userinfo.uid 不相等
              if (Number(uid) !== Number(window.userinfo.uid)) {
                delete window.userinfo
                delete window.rootPath
                window.location.href = window.location.pathname
                return false
              }
            }
          }
        }
        // 如果请求的数据返回的是ok
        if (data.stat !== 'OK') {
          data.errText = data.errText ? data.errText : i18n[lang]['error.network']
          if (data.errText === '服务端异常') {
            data.errText = i18n[lang]['error.network']
          }
          // 管理员删除账户后提示“用户不存在“
          if (data.stat === 'ERR_USER_NOT_FOUND') {
            // 清除token
            setCookie('token', '', '', '/')
            $.alert(data.errText, {
              ok: function () {
                window.location.href = window.login ? window.login : 'login.html'
              },
              cancel: function () {
                window.location.href = window.login ? window.login : 'login.html'
              }
            })
          }
        }
        if (opt.done) opt.done(data)
        else dtd.resolve(data)
      })
      .fail(function (data) {
        if (opt.fail) opt.fail(data)
        else dtd.reject(data)
      })
      .always(function (data) {
        if (opt.dataType === 'json' && typeof (data) === 'string') data = $.parseJSON(data)
        if (opt.always) opt.always(data)
      })
    return dtd.promise()
  }
  function getCookie (str) {
    var str = str ? str : document.cookie
    var arr = str.split('; ')
    var cookie = {}
    $.each(arr, function (i, v) {
      var tmp = v.split('=')
      cookie[tmp[0]] = tmp[1]
    })
    return cookie
  }
  function setCookie (key, value, expire, path) {
    var date = new Date()
    date.setTime(date.getTime() + expire * 3600 * 1000)
    var str = key + '=' + value + '; expires=' + date.toGMTString() + '; path=' + path
    document.cookie = str
  }
  // 判断两个对象是否相等，深遍历
  function eq (a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b
    // Compare `[[Class]]` names.
    var className = Object.prototype.toString.call(a)
    if (className !== Object.prototype.toString.call(b)) return false
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b
    }

    var areArrays = className === '[object Array]'
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
        && ('constructor' in a && 'constructor' in b)) {
        return false
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || []
    bStack = bStack || []
    var length = aStack.length
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a)
    bStack.push(b)

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length
      if (length !== b.length) return false
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key
      length = keys.length
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false
      while (length--) {
        // Deep compare each member
        key = keys[length]
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop()
    bStack.pop()
    return true
  }
  function checkObj (checkHandle) {
    return function (obj) {
      var flag = true
      $.each(obj, function (i, v) {
        flag = checkHandle(v)
        if (flag === false) return false
      })
      return flag
    }
  }
})(jQuery)
