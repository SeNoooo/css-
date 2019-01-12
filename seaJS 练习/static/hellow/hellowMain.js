// This is app main module JS file  
define(function(require, exports, module){  
  //1,define intenal variable area//变量定义区  
  var moduleName = "hellow module";  
  var version = "1.0.0";  
        
  //2,load each dependency   
  // 引入所依赖的模块
  var workjs = require("hellow");  
        
  //3,define intenal funciton area//函数定义区  
  exports.loadTip = function(refConId){  
      var tipMsg = "module is loaded finish.";  
      // 如果loadTip没有传参数，那么就弹出alert
      if(undefined === refConId || null === refConId || "" === refConId+""){  
          alert(tipMsg);  
      }else{  
        // 如果loadTip传了参数，那么就找到这个参数对应id值的元素，然后把tipMsg给元素的内容
          document.getElementById(refConId+"").innerHTML = tipMsg;  
      }  
  };  
    
  exports.initEvent = function(){       
      workjs.initEvent();  
      // 如果不穿值，alert弹出
      // 如果传div02 则找到div02把tipMsg给div02的内容
      exports.loadTip('div02');  
  };  
    
  //4,export this module API for outside other module  
  //暴露本模块API给外部其它模块使用  
  module.exports = exports;  
    
  //5,auto run initEvent function when module loaded finish  
  //启用时在加载完将自动运行某方法  
  //exports.initEvent();  
});