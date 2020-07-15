const path = require('path')
const prod = process.env.NODE_ENV === 'production'
const TerserPlugin = require('terser-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin")

const assetsCDN = {
  externals: {
    vue: 'Vue',
    vuex: 'Vuex',
    'vue-router': 'VueRouter',

    'codemirror': 'CodeMirror',
    'codemirror/mode/javascript/javascript': 'CodeMirror',
    'vue-codemirror': 'VueCodemirror',
    axios: 'axios',
    'ant-design-vue': 'antd',

    echarts: 'echarts',
    d3: 'd3',
    'd3-sankey': 'd3'
  },
  js: [
    '//cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js',
    '//cdn.jsdelivr.net/npm/vuex@3/dist/vuex.min.js',
    '//cdn.jsdelivr.net/npm/vue-router@3/dist/vue-router.min.js',

    '//cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.min.js',
    // js高亮
    '//cdn.jsdelivr.net/npm/codemirror@5/mode/javascript/javascript.min.js',
    '//cdn.jsdelivr.net/npm/vue-codemirror@4/dist/vue-codemirror.min.js',

    '//cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
    '//cdn.jsdelivr.net/npm/ant-design-vue@1/dist/antd.min.js',

    '//cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js',
    '//cdn.jsdelivr.net/npm/d3@5/dist/d3.min.js',
    '//cdn.jsdelivr.net/npm/d3-sankey@0/dist/d3-sankey.min.js',
  ],
  css: [
    '//cdn.jsdelivr.net/npm/ant-design-vue@1/dist/antd.min.css',

    '//cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.min.css',
    // 主题
    '//cdn.jsdelivr.net/npm/codemirror@5/theme/lucario.min.css'
  ],
}

module.exports = {
  publicPath: prod
    ? '/projects/exploratory-analysis-system/'
    : '/',
  outputDir: '../index-deploy/www/projects/exploratory-analysis-system',
  assetsDir: 'assets',
  indexPath: 'index.html',

  productionSourceMap: false,

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
      }
    },
    externals: prod ? assetsCDN.externals : {},
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
    },
    plugins: [
      new BundleAnalyzerPlugin(),
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css)$/,// 匹配文件名
        threshold: 10240, // 对超过10k的数据压缩
        deleteOriginalAssets: false, // 不删除源文件
        minRatio: 0.8 // 压缩比
      })
    ]
  },
  chainWebpack: (config) => {
    config.plugin('html').tap(args => {
      args[0].prod = prod;
      args[0].cdn = {};
      args[0].cdn.js = prod ? assetsCDN.js : [];
      args[0].cdn.css = assetsCDN.css;
      return args
    })
  }
}
