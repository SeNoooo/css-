;(function ($) {
  $.dialog = function (opts) {
    // 设置传入参数的默认值
    var defaultOpts = {
      title: '我的弹窗', // 标题
      content: '', // 内容
      height: 200, // 高度
      width: 200, // 宽度
      draggable: true, // 弹窗拖拽功能
      delayTime: 2000, // 效果的延迟时间
      ok: '确定', // 确定按钮
      okCallback: function () {}, // 确定按钮的回调函数
      cancel: '取消', // 取消按钮
      cancelCallback: function () {}, // 取消按钮的回调函数
      before: function () {
        console.log('before')
      },
      close: function (a) {
        console.log('close' + a)
      },
      blankClose: false // 点击空白处是否关闭
    }
    // 合并defaultOpts和opts
    for (var i in defaultOpts) {
      if (opts[i] === undefined) {
        opts[i] = defaultOpts[i]
      }
    }
    opts.before && opts.before()
    // dom结构(定义弹框的模板)
    // 定义一个数组对象，里面放弹框的dom元素 alert-mask为全屏的遮罩层,
    // alert-content为弹框的主要内容区，最后通过.join('')函数将数组转换为html字串，// 再用jquery的append()方法追加在body节点最后
    var alertHtml = [
      '<section class="alert-main" id="alertMain">',
      '<div class="alert-mask" id="alertMask"></div>',
      '<div class="alert-content" id="alertContent"><div class="alert-header" id="alertHeader"><div class="alert-title" id="alertTitle">' + opts.title + '</div><span class="alert-close" id="alertClose">x</span><p style="clear:both"></p></div><div class="alert_body" id="alertBody"></div>',
      '</section>'
    ]
    $('body').append(alertHtml.join(''))
    // 设置弹窗在屏幕中的位置
    // 获取弹窗元素
    var $alertContent = $('#alertContent')
    var $alertMain = $('#alertMain')
    var $alertHeader = $('#alertHeader')
    // var $alertTitle = $('#alertTitle')
    var $alertClose = $('#alertClose')
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
      'top': ($(window).height() - opts.height) / 2 + 'px',
      'left': ($(window).width() - opts.width) / 2 + 'px'
    })
    // 弹窗头部样式
    $alertHeader.css({
      'width': opts.width + 'px'
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
          console.log(x, y)
          x = x >= 0 ? x : 0
          x = x <= $(window).width() - opts.width ? x : $(window).width() - opts.width
          y = y >= 0 ? y : 0
          y = y <= $(window).height() - opts.height ? y : $(window).height() - opts.height
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
    $alertClose.on('click', function () {
      $alertMain.remove()
    })
    // 点击空白出关闭弹窗
    if (opts.blankClose) {
      $('.alert-mask').on('click', function (event) {
        // 移除整个alertMain元素
        $alertMain.remove()
        opts.close && opts.close('blankClose')
        // 阻止事件向上冒泡
        event.stopPropagation()
        // 阻止时间的默认行为
        event.preventDefault()
      })
    }
  }
})(jQuery)