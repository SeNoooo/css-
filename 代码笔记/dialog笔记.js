;(function ($) {
  // dialog模拟对话框插件
  // $.fn 把dialog这个方法放到了jquery的原型对象里，只要创建实例，就可以使用这个方法
  $.fn.dialog = function (option, value) {
    if (typeof (option) === 'string') {
      return $.fn.dialog.methods[option](this, value)
    }
    // option是调用dialog时传入的第一个对象参数
    option = option || {}
    // ？？？
    // this指向id为xdialog的元素
    // this.data() 指向的是id为xdialog的元素的data对象
    var data = this.data('data')
    // 此时data为undefined ？？？
    // 点击保存后 data出现了
    console.log(data)
    if (data) {
      // extend方法就是将多个对象里的属性组合起来，如果同一个属性，多个对象都有，则使用后面对象的属性值。
      $.extend(data.options, option)
    } else {
      // 判断id为xdialog的元素是否有data-options属性，如果没有，options为空
      var options = this.attr('data-options') || ''
      console.log(options)
      // ???
      options = eval('({' + options + '})')
      console.log(options)
      // 合并options和option 相同属性以option值为准
      $.extend(options, option)
      // 给xdialog一个data方法，传入'data' ?????
      this.data('data', {
        options: $.extend({}, $.fn.dialog.defaults, options)
      })
      // 此时输出一个函数
      console.log(this.data)
    }
    init(this, this.data('data').options)
    return this
  }
  // dialog默认参数
  $.fn.dialog.defaults = {
    width: 400,
    height: 300,
    title: '',
    showHeader: true,
    data: null,
    buttons: null,
    onInited: null,
    onClosed: null,
    draggable: true,
    align: 'right'
  }
  // dialog默认方法
  $.fn.dialog.methods = {
    // 关闭dialog
    close: function ($obj) {
      var options = $obj.data('data').options
      if (options.onClosed && options.onClosed() === false) {
        return false
      }
      $obj.removeData('data')
      // 移除$obj上通过on所绑定的事件并清空html内容给css加上透明属性 隐藏起来移除
      $obj.off().html('').css('opacity', 0).hide().remove()
      // 调用$.mask函数 传入参数xdialog true 移除该遮罩层
      $.mask($obj[0].id, true)
    },
    // 给dialog底部添加按钮
    addButton: function ($obj, value) {
      var callbacks = $obj.data('data').callbacks
      str = '<button type="button" name="' + value.name + '" class="'
      if (value.cls) {
        str += value.cls
      } else {
        str += 'btn-default'
      }
      str += '">' + value.text + '</button>'
      if (value.handler) callbacks[value.name] = value.handler
      $obj.find('.xdialog-footer').append(str)
    }
  }
  // dialog初始化方法
  // init(this, this.data('data').options)
  var init = function ($obj, options) {
    // 此时$('.xmask').length值为0
    // 点击保存后，值变为1
    console.log($('.xmask').length)
    if ($('.xmask').length) {
      var index = parseInt($('.xmask').eq($('.xmask').length - 1).css('z-index'))
      $obj.css('z-index', index + 21)
    }
    // 设置最小宽度为200
    options.width = options.width >= 200 ? options.width : 200
    if (!options.height) {
      // 如果不存在hegiht值，则设置height值最小为320
      options.height = options.height >= 320 ? options.height : 320
    }
    $obj.addClass('xdialog')
    var str = ''
    // dialog 默认参数showheader为true
    if (options.showHeader === false) {
      str = [
        '<div class="xdialog-bodywrap">',
        '<div class="xdialog-body"></div>',
        '</div>'
      ].join('')
    } else {
      // 把数组用''分割开来放入字符串中
      str = [
        '<div class="xdialog-header">',
        '<span class="xdialog-title">', options.title, '</span>',
        '<span class="xdialog-close"></span>',
        '</div>',
        '<div class="xdialog-bodywrap">',
        '<div class="xdialog-body"></div>',
        '</div>'
      ].join('')
      // 输出一段html片段
      // console.log(str)
    }
    // button事件回调集合
    var callbacks = {}
    if (options.buttons) {
      str += '<div class="xdialog-footer">'
      // 遍历options.buttons
      // 例如保存 取消按钮
      $.each(options.buttons, function (i, v) {
        str += '<button type="button" name="' + v.name + '" class="'
        if (v.cls) {
          str += v.cls
        } else {
          str += 'btn-default'
        }
        str += '">' + v.text + '</button>'
        // 如果该按钮有handler函数  给callbacks对象一个下标为v.name的值是v.handler
        if (v.handler) callbacks[v.name] = v.handler
        // 当遍历到最后一个button时，给加上div结束标签
        if (i === options.buttons.length - 1) {
          str += '</div>'
        }
      })
    }
    $obj.data('data').callbacks = callbacks
    str += ''
    // 在dialog的默认方法中定义  ？？？？
    $.mask($obj[0].id)
    $obj.html(str)

    // 在dialog默认值中draggable为true
    if (options.draggable) {
      // jquery ui draggable函数
      $obj.draggable({
        // 指定 只能在class属性为xdialog-header的元素上进行拖拽
        handle: '.xdialog-header'
      })
    }
    // 在dialog默认值中data为null 如果默认值data有值，则把data值放入xdialog-body中
    if (options.data) {
      $obj.find('.xdialog-body').html(options.data)
      if ($obj.find('.xdialog-body form').length) {
        // 如果在class为.xdialog-body的元素下有class为form的元素
        // 那么在该元素下加入隐藏的input
        $obj.find('.xdialog-body form').append('<input type="text" style="display:none;">')
      }
      // blur 是失去焦点事件
      $obj.find('input, textarea').blur(function (event) {
        var $this = $(this)
        if ($this.attr('type') !== 'password') {
          // trim去掉字符串两端多余的空格
          var value = $.trim($this.val())
          $this.val(value)
        }
      })
      // 如果$实例对象有placehold属性
      // ？？？？
      if ($.fn.hasOwnProperty('placeholder')) $obj.find('input, textarea').placeholder()
      // 此函数在下面定义了
      setPosition($obj, options)
      // 如果options中有onInited函数  则在此时调用onInited函数
      if (options.onInited) options.onInited()
    } else if (options.url) {
      // 如果options.data为空 并且options.url存在
      $obj.find('.xdialog-body').html('<span class="xdialog-loading"></span>')
      // 用$.request发送向options.url发送请求
      $.request({
        url: options.url,
        isCheck: false,
        type: 'get',
        dataType: 'html',
        done: function (data) {
          // 把拿回来的html片段放入xdialog-body中
          $obj.find('.xdialog-body').html(data)
          // 判断是否有class为form的元素
          if ($obj.find('.xdialog-body form').length) {
            // 如果存在加上一个input并隐藏
            $obj.find('.xdialog-body form').append('<input type="text" style="display:none;">')
          }
          // 如果有textarea输入框 当他失去焦点时，去掉字符串两端空格
          $obj.find('input, textarea').blur(function (event) {
            var $this = $(this)
            var value = $.trim($this.val())
            $this.val(value)
          })
          if ($.fn.hasOwnProperty('placeholder')) $obj.find('input, textarea').placeholder()
          setPosition($obj, options)
          if (options.onInited) options.onInited()
        }
      })
    }
    bind($obj)
  }
  // 事件绑定方法
  var bind = function ($obj) {
    $obj.on('click', '.xdialog-close', function (event) {
      event.preventDefault()
      $obj.dialog('close')
    })
    $obj.on('click', '.xdialog-footer button', function (event) {
      event.preventDefault()
      $this = $(this)
      var name = $this.attr('name')
      var callbacks = $obj.data('data').callbacks
      if (callbacks.hasOwnProperty(name)) {
        callbacks[name]()
      }
    })
  }

  // 定位函数
  var setPosition = function ($obj, options) {
    var height = null
    if (options.height === 'auto') {
      $obj.css({
        width: options.width,
        height: 'auto'
      })
      // 限制最大高度
      if ($obj.height() > $(window).height() - 60) {
        $obj.css({
          height: $(window).height() - 60
        })
        height = $obj.height()
      } else {
        height = 'auto'
      }
    } else {
      height = options.height
      $obj.css({
        width: options.width,
        height: height
      })
    }
    if (options.showHeader && height !== 'auto') height -= 40
    if (options.buttons && options.buttons.length && height !== 'auto') height -= 80
    $obj.find('.xdialog-bodywrap').css({
      height: height
    })
    $obj.find('.xdialog-body').css({
      height: height === 'auto' ? 'auto' : height - 20,
      width: options.width - 50
    })
    var top = ($(window).height() - $obj.height()) / 2
    var left = ($(window).width() - $obj.width()) / 2
    if (top < 0) {
      top = '10px'
    }
    $obj.css({
      left: left,
      top: top
    }).show()
    $obj.animate({
      opacity: 1
    }, 100).show()
  }
})(jQuery)
;(function ($) {
  $.dialog = function (option, value) {
    if (!$('#xdialog').length) {
      $('body').append('<div id="xdialog"></div>')
    }
    $('#xdialog').dialog(option, value)
    return this
  }
})(jQuery)
