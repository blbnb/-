// pages/test/test.js
const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    testResults: [],
    testing: false
  },

  onLoad: function (options) {
    // 自动开始测试
    this.runAllTests()
  },

  runAllTests: function() {
    this.setData({ testing: true, testResults: [] })
    
    const tests = [
      {
        name: '测试 API 配置',
        fn: this.testAPIConfig
      },
      {
        name: '测试获取图书列表',
        fn: this.testGetBooks
      },
      {
        name: '测试创建图书',
        fn: this.testCreateBook
      }
    ]

    // 依次执行测试
    let index = 0
    const runTest = () => {
      if (index < tests.length) {
        const test = tests[index]
        console.log(`执行测试：${test.name}`)
        test.fn.call(this).then((result) => {
          this.addTestResult(test.name, result)
          index++
          setTimeout(runTest, 500)
        })
      } else {
        this.setData({ testing: false })
      }
    }

    runTest()
  },

  testAPIConfig: function() {
    return new Promise((resolve) => {
      const baseUrl = api.API_BASE_URL
      if (baseUrl && baseUrl.includes('http')) {
        resolve({
          success: true,
          message: `API 地址：${baseUrl}`
        })
      } else {
        resolve({
          success: false,
          message: 'API 地址配置错误'
        })
      }
    })
  },

  testGetBooks: function() {
    return new Promise((resolve) => {
      api.book.getList({ page: 1, per_page: 10 })
        .then((res) => {
          resolve({
            success: true,
            message: `获取 ${res.data.length} 本图书`
          })
        })
        .catch((err) => {
          resolve({
            success: false,
            message: `获取失败：${err.errMsg || '未知错误'}`
          })
        })
    })
  },

  testCreateBook: function() {
    return new Promise((resolve) => {
      const testData = {
        title: '测试书籍-' + Date.now(),
        author: '测试作者',
        price: 9.9,
        stock: 1,
        category: '测试',
        description: '用于测试的书籍'
      }

      api.book.create(testData)
        .then((res) => {
          resolve({
            success: true,
            message: '创建成功'
          })
        })
        .catch((err) => {
          resolve({
            success: false,
            message: `创建失败：${err.errMsg || '未知错误'}`
          })
        })
    })
  },

  addTestResult: function(name, result) {
    const results = this.data.testResults
    results.push({
      name: name,
      success: result.success,
      message: result.message,
      time: new Date().toLocaleTimeString()
    })
    this.setData({ testResults: results })
  },

  onRefresh: function() {
    this.runAllTests()
  }
})
