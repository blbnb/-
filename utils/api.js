// 小程序 API 配置
// 后端服务地址
// 开发环境：使用局域网 IP 或 localhost
// 注意：小程序需要配置合法域名，开发时可勾选"不校验合法域名"
const API_BASE_URL = 'http://192.168.8.199:8000/api';
// const API_BASE_URL = 'http://localhost:8000/api';  // 备用

// 书籍相关 API 配置
const BOOK_API = {
  LIST: `${API_BASE_URL}/books`,
  DETAIL: (bookId) => `${API_BASE_URL}/books/${bookId}`,
  CREATE: `${API_BASE_URL}/books`,
  UPDATE: (bookId) => `${API_BASE_URL}/books/${bookId}`,
  DELETE: (bookId) => `${API_BASE_URL}/books/${bookId}`
};

// API 接口配置
const API = {
  // 认证相关
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    USER_INFO: (userId) => `${API_BASE_URL}/auth/user/${userId}`
  },
  
  // 用户相关
  USER: {
    LIST: `${API_BASE_URL}/users`,
    DETAIL: (userId) => `${API_BASE_URL}/users/${userId}`,
    UPDATE: (userId) => `${API_BASE_URL}/users/${userId}`,
    DELETE: (userId) => `${API_BASE_URL}/users/${userId}`,
    STATS: `${API_BASE_URL}/users/stats/overview`
  },
  
  // 图书相关
  BOOK: {
    LIST: `${API_BASE_URL}/books`,
    DETAIL: (bookId) => `${API_BASE_URL}/books/${bookId}`,
    CREATE: `${API_BASE_URL}/books`,
    UPDATE: (bookId) => `${API_BASE_URL}/books/${bookId}`,
    DELETE: (bookId) => `${API_BASE_URL}/books/${bookId}`,
    STATS: `${API_BASE_URL}/books/stats/overview`
  },
  
  // 订单相关
  ORDER: {
    LIST: `${API_BASE_URL}/orders`,
    DETAIL: (orderId) => `${API_BASE_URL}/orders/${orderId}`,
    CREATE: `${API_BASE_URL}/orders`,
    UPDATE_STATUS: (orderId) => `${API_BASE_URL}/orders/${orderId}/status`,
    DELETE: (orderId) => `${API_BASE_URL}/orders/${orderId}`,
    STATS: `${API_BASE_URL}/orders/stats/overview`
  }
};

// 请求封装
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取 token（如果已登录）
    const token = wx.getStorageSync('token');
    
    // 默认请求头
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Type': 'miniprogram',
      'X-App-Version': '1.0.0'
    };
    
    // 如果有 token，添加到请求头
    if (token) {
      defaultHeaders['Authorization'] = 'Bearer ' + token;
    }
    
    // 合并自定义请求头
    const headers = {
      ...defaultHeaders,
      ...options.header
    };
    
    wx.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      timeout: 15000,
      success: (res) => {
        // 检查响应状态码 - 接受 200 和 201 (201 表示创建成功)
        if (res.statusCode !== 200 && res.statusCode !== 201) {
          console.error('HTTP 错误:', res.statusCode);
          wx.showToast({
            title: '请求失败：' + res.statusCode,
            icon: 'none'
          });
          reject(res.data);
          return;
        }
        
        // 检查响应数据是否为对象
        if (typeof res.data !== 'object' || res.data === null) {
          console.error('非 JSON 响应:', res.data);
          wx.showToast({
            title: '服务器响应格式错误',
            icon: 'none'
          });
          reject({
            success: false,
            message: '服务器响应格式错误'
          });
          return;
        }
        
        // 检查业务逻辑是否成功
        if (res.data.success === false) {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(res.data);
          return;
        }
        
        // 成功
        resolve(res.data);
      },
      fail: (err) => {
        console.error('请求错误:', err);
        let errorMsg = '网络错误';
        
        if (err.errMsg && err.errMsg.includes('timeout')) {
          errorMsg = '请求超时，请检查网络';
        } else if (err.errMsg && err.errMsg.includes('fail')) {
          errorMsg = '无法连接服务器';
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

// API 调用方法
const api = {
  // 认证
  auth: {
    login: (data) => request({
      url: API.AUTH.LOGIN,
      method: 'POST',
      data
    }),
    getUserInfo: (userId) => request({
      url: API.AUTH.USER_INFO(userId)
    })
  },
  
  // 用户
  user: {
    getList: (params) => request({
      url: API.USER.LIST,
      data: params
    }),
    getDetail: (userId) => request({
      url: API.USER.DETAIL(userId)
    }),
    update: (userId, data) => request({
      url: API.USER.UPDATE(userId),
      method: 'PUT',
      data
    }),
    delete: (userId) => request({
      url: API.USER.DELETE(userId),
      method: 'DELETE'
    }),
    getStats: () => request({
      url: API.USER.STATS
    })
  },
  
  // 图书
  book: {
    getList: (params) => request({
      url: API.BOOK.LIST,
      data: params
    }),
    getDetail: (bookId) => request({
      url: API.BOOK.DETAIL(bookId)
    }),
    create: (data) => request({
      url: API.BOOK.CREATE,
      method: 'POST',
      data
    }),
    update: (bookId, data) => request({
      url: API.BOOK.UPDATE(bookId),
      method: 'PUT',
      data
    }),
    delete: (bookId) => request({
      url: API.BOOK.DELETE(bookId),
      method: 'DELETE'
    }),
    getStats: () => request({
      url: API.BOOK.STATS
    }),
    // 新增书籍相关快捷方法
    publish: (data) => request({
      url: API.BOOK.CREATE,
      method: 'POST',
      data
    }),
    updateBook: (bookId, data) => request({
      url: API.BOOK.UPDATE(bookId),
      method: 'PUT',
      data
    })
  },
  
  // 订单
  order: {
    getList: (params) => request({
      url: API.ORDER.LIST,
      data: params
    }),
    getDetail: (orderId) => request({
      url: API.ORDER.DETAIL(orderId)
    }),
    create: (data) => request({
      url: API.ORDER.CREATE,
      method: 'POST',
      data
    }),
    updateStatus: (orderId, status) => request({
      url: API.ORDER.UPDATE_STATUS(orderId),
      method: 'PUT',
      data: { status }
    }),
    delete: (orderId) => request({
      url: API.ORDER.DELETE(orderId),
      method: 'DELETE'
    }),
    getStats: () => request({
      url: API.ORDER.STATS
    })
  }
};

module.exports = {
  API_BASE_URL,
  API,
  request,
  api
};
