module.exports = {
  devtool:'eval-source-map',
  entry:__dirname+"/app/main.js", //唯一个入口文件
  output: {
    path: __dirname+"/public",    //打包后文件存放的地方
    filename:"bundle.js"          //打包后输出文件的文件名
  },
  //可以让浏览器监听代码的修改，自动刷新 提供一个本地开发服务器
  devServer:{
    contentBase:'./public',  //本地服务器所加载的页面所在的目录
    historyApiFallback: true,     //不跳转
    inline:true               //实时更新  
  },
  // 在webpack中配置Babel的方法
  module:{
    rules: [
      {
        test:/(\.jsx|\.js)$/,
        use: {
          loader:"babel-loader"
        },
        exclude:/node_modules/
      },
      {
        test:/\.css$/,
        // 对一个文件引入多个loader的写法
        use:[
          {
            loader:"style-loader"
          },
          {
            loader:"css-loader",
            options:{
              modules:true,  //指定启用css modules
              localIdentName: '[name]_[local]_[hash:base64:5]'//指定css的类名格式
            }
          }
        ]
      },
    ] 
  }
}