const path = require('path')
const debug = process.env.NODE_ENV !== 'production'
const CompressionPlugin = require("compression-webpack-plugin")
//const VueConf = require('./src/assets/js/libs/vue_config_class')
//const vueConf = new VueConf(process.argv)



module.exports = {
  publicPath: !debug
    ? '/exploratory-analysis-system/'
    : '/',
  // 构建输出目录
  outputDir: 'D:/Documents/GitHub/aizf.github.io/exploratory-analysis-system',

  // 静态资源目录 (js, css, img, fonts)
  assetsDir: 'assets',

  indexPath: 'index.html',

  // lintOnSave: true, // 是否开启eslint保存检测，有效值：ture | false | 'error'
  // runtimeCompiler: true, // 运行时版本是否需要编译
  // transpileDependencies: [], // 默认babel-loader忽略mode_modules，这里可增加例外的依赖包名
  // 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度
  productionSourceMap: false,

  // productionSourceMap: true, // 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度
  //     css: { // 配置高于chainWebpack中关于css loader的配置
  //     modules: true, // 是否开启支持‘foo.module.css’样式
  //     extract: true, // 是否使用css分离插件 ExtractTextPlugin，采用独立样式文件载入，不采用<style>方式内联至html文件中
  //     sourceMap: false, // 是否在构建样式地图，false将提高构建速度
  //     loaderOptions: { // css预设器配置项
  //         sass: {
  //             data: ''//`@import "@/assets/scss/mixin.scss";`
  //         }
  //     }
  // },
  devServer: {
    host: '127.0.0.1',
    hot: true
  },

  // chainWebpack: config => { // webpack链接API，用于生成和修改webapck配置，
  //     if (debug) {
  //         // 本地开发配置
  //     } else {
  //         // 生产开发配置
  //     }
  // },
  // parallel: require('os').cpus().length > 1, // 构建时开启多进程处理babel编译
  // pluginOptions: { // 第三方插件配置
  // },
  // pwa: { // 单页插件相关配置 https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  // },
  configureWebpack: config => { // webpack配置，值位对象时会合并配置，为方法时会改写配置
    if (debug) { // 开发环境配置
      config.mode = 'development';
    } else { // 生产环境配置
      config.mode = 'production';

      // Gzip
      config.plugins = [
        ...config.plugins,
        new CompressionPlugin({
          test: /\.js$|\.html$|\.css/, //匹配文件名
          threshold: 10240,//对超过10k的数据压缩
          deleteOriginalAssets: false //不删除源文件
        })
      ];
    }
    Object.assign(config, { // 开发生产共同配置，配置别名
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@c': path.resolve(__dirname, './src/components'),
          // 'vue$': 'vue/dist/vue.esm.js'
        }
      }
    })
  }
}
