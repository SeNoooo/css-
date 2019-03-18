;(function ($) {
  $.dialog = function (opts) {
    // 设置传入参数的默认值
    var defaultOpts = {
      title: '我的弹窗', // 标题
      content: '', // 内容
      height: 200, // 高度
      width: 200, // 宽度
      buttons: null, // 传入的按钮信息
      draggable: true, // 弹窗拖拽功能
      url: '', // 请求访问的url地址 返回html页面放入alert-body中去
      blankClose: true // 点击空白处是否关闭 默认为true
    }
    // 合并defaultOpts和opts
    for (var i in defaultOpts) {
      if (opts[i] === undefined) {
        opts[i] = defaultOpts[i]
      }
    }
    // dom结构(定义弹框的模板)
    // 定义一个数组对象，里面放弹框的dom元素 alert-mask为全屏的遮罩层,
    // alert-content为弹框的主要内容区，最后通过.join('')函数将数组转换为html字串，// 再用jquery的append()方法追加在body节点最后
    var alertHtml = [
      '<section class="alert-main" id="alertMain">',
      '<div class="alert-mask" id="alertMask"></div>',
      '<div class="alert-content" id="alertContent"><div class="alert-header" id="alertHeader"><div class="alert-title" id="alertTitle">' + opts.title + '</div><span class="alert-close" id="alertClose">x</span><p style="clear:both"></p></div><div class="alert-body" id="alertBody"></div><div class="alert-footer" id="alertFooter"></div>',
      '</section>'
    ]
    $('body').append(alertHtml.join(''))
    // 设置弹窗在屏幕中的位置
    // 获取弹窗元素
    var $alertContent = $('#alertContent')
    var $alertMain = $('#alertMain')
    var $alertHeader = $('#alertHeader')
    var $alertBody = $('#alertBody')
    var $alertFooter = $('#alertFooter')
    if (opts.width < 200) {
      opts.width = 200
    }
    if (opts.height < 200) {
      opts.height = 200
    }
    // 给弹窗添加css样式 给$alertContent元素一个固定定位
    $alertContent.css({
      'height': opts.height + 'px',
      'width': opts.width + 'px',
      // 用$(window).height()方法获取此时的页面高度
      'top': opts.height > $(window).height() - 60 ? 60 : ($(window).height() - opts.height) / 2 + 'px',
      'left': ($(window).width() - opts.width) / 2 + 'px'
    })
    // 弹窗头部样式
    $alertHeader.css({
      'width': opts.width + 'px'
    })
    $alertBody.css({
      'height': opts.height - 110 + 'px'
    })
    // 给弹窗底部添加按钮功能
    // 遍历传回来的button数据
    var str = ''
    // 创建了一个对象
    var callbacks = {}
    $.each(opts.buttons, function (i, v) {
      str += '<button type="button" name="' + v.name + '" class="alert-button"">' + v.text + '</button>'
      // 当buttons里有属性handle时，
      // 把这个按钮的name作为属性名 handle作为属性值粗出道callbacks对象中
      if (v.handle) callbacks[v.name] = v.handle
    })
    $alertFooter.append(str)
    // button的点击事件
    $alertMain.on('click', '.alert-button', function (event) {
      event.preventDefault()
      var $this = $(this)
      var name = $this.attr('name')
      // 当点击button时
      // 选中此时点击的button的name属性
      // 判断此时在callbacks对象中有没有对应name属性的值 如果有
      // 在callbacks对象中找到对应的name属性的handle属性值并调用
      if (callbacks[name]) {
        callbacks[name]()
      } else {
        console.log('木有')
      }
    })
    // 弹窗的拖拽功能
    if (opts.draggable) {
      $alertHeader.css('cursor', 'move')
      var _x = ''
      var _y = ''
      var _move = ''
      $alertHeader.mousedown(function (event) {
        event.preventDefault()
        _move = true
        _x = event.pageX - parseInt($alertContent.css('left'))
        _y = event.pageY - parseInt($alertContent.css('top'))
      })
      $(document).mousemove(function (event) {
        if (_move) {
          var x = event.pageX - _x
          var y = event.pageY - _y
          x = x >= 0 ? x : 0
          y = y >= 0 ? y : 0
          // 仅需设置左上方拖拽限制，否则当页面大小小于弹窗大小时拖拽功能不正常
          // x = x <= $(window).width() - opts.width ? x : $(window).width() - opts.width
          // y = y <= $(window).height() - opts.height ? y : $(window).height() - opts.height
          $alertContent.css({
            left: x,
            top: y
          })
        }
      }).mouseup(function (event) {
        _move = false
      })
    }
    // 点击x关闭弹窗
    $alertMain.on('click', '.alert-close', function () {
      // 去掉这个元素上的所有绑定的事件，然后移除元素
      $alertMain.off().remove()
    })
    // 点击空白出关闭弹窗
    if (opts.blankClose) {
      $alertMain.on('click', '.alert-mask', function (event) {
        // 移除整个alertMain元素
        $alertMain.off().remove()
        // 阻止事件向上冒泡
        event.stopPropagation()
        // 阻止时间的默认行为
        event.preventDefault()
      })
    }
    // 发送请求访问url返回html
    $.request({
      url: opts.url,
      dataType: 'html',
      // 如果失败了，可以返回这个函数
      fail: function () {
        console.log('fail')
      }
    }).done(function (data) {
      $alertBody.append(data)
    })
  }
})(jQuery)