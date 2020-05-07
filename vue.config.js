const path = require('path')
const prod = process.env.NODE_ENV === 'production'
const TerserPlugin = require('terser-webpack-plugin')
// const CompressionPlugin = require("compression-webpack-plugin")

const assetsCDN = {
  externals: {
    vue: 'Vue',
    vuex: 'Vuex',
    'vue-router': 'VueRouter',

    // 'vue-codemirror': 'VueCodemirror',
    axios: 'axios',
    'ant-design-vue': 'antd',

    echarts: 'echarts',
    d3: 'd3',
    // 'd3-sankey':''
  },
  css: [],
  // https://unpkg.com/browse/vue@2.6.10/
  js: [
    '//cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js',
    '//cdn.jsdelivr.net/npm/vuex@3/dist/vuex.min.js',
    '//cdn.jsdelivr.net/npm/vue-router@3/dist/vue-router.min.js',

    // '//cdn.jsdelivr.net/npm/vue-codemirror@4/dist/vue-codemirror.min.js',
    '//cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
    '//cdn.jsdelivr.net/npm/ant-design-vue@1/dist/antd.min.js',

    '//cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js',
    '//cdn.jsdelivr.net/npm/d3@5/dist/d3.min.js',
    // '//cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js',
  ]
}

module.exports = {
  publicPath: prod
    ? '/exploratory-analysis-system/'
    : '/',
  outputDir: 'D:/Documents/GitHub/aizf.github.io/exploratory-analysis-system',
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
  // parallel: require('os').cpus().length > 1, // 构建时开启多进程处理babel编译
  // pluginOptions: { // 第三方插件配置
  // },
  // pwa: { // 单页插件相关配置 https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  // },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@c': path.resolve(__dirname, './src/components'),
        // 'vue$': 'vue/dist/vue.esm.js'
      }
    },
    externals: prod ? assetsCDN.externals : {},
    // externals: assetsCDN.externals,
    optimization: {
      minimizer: [
        !prod ? new TerserPlugin() : new TerserPlugin({
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {
              drop_console: true,
              drop_debugger: true,
              // pure_funcs: ['console.log']
            }
          },
        }),
      ]
    }
  },
  chainWebpack: (config) => {
    if (prod) {
      config.plugin('html').tap(args => {
        args[0].cdn = assetsCDN;
        args[0].prod = prod;
        return args
      })
    }
  }
}
