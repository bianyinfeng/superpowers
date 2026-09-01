(function () {
  var DEFAULT_CONFIG = {
    useMock: true,
    apiBaseUrl: 'http://127.0.0.1:8081/api',
    requestTimeoutMs: 10000,
    authToken: ''
  };

  var ENDPOINTS = {
    currentUser: '/auth/me',
    requirements: '/requirements',
    workflowSteps: '/workflow/steps',
    dataStandards: '/standards',
    matchResults: '/standards/matches',
    devSpecs: '/devspecs',
    scripts: '/scripts',
    deployments: '/deployments',
    qualityRules: '/quality/rules',
    batchJobs: '/batch/jobs',
    metadataTables: '/metadata/tables',
    scanConfigs: '/metadata/scans',
    activities: '/activities',
    notifications: '/notifications'
  };

  function readBoolean(text, defaultValue) {
    if (text === undefined || text === null || text === '') {
      return defaultValue;
    }
    return String(text).toLowerCase() === 'true';
  }

  function readConfig() {
    var runtime = window.__DATAOPS_CONFIG || {};
    var useMockFromStorage = null;
    var apiBaseFromStorage = null;
    var tokenFromStorage = null;

    try {
      useMockFromStorage = localStorage.getItem('dataops.useMock');
      apiBaseFromStorage = localStorage.getItem('dataops.apiBaseUrl');
      tokenFromStorage = localStorage.getItem('dataops.authToken');
    } catch (error) {
      // ignore storage access errors in private mode
    }

    return {
      useMock: readBoolean(runtime.useMock, readBoolean(useMockFromStorage, DEFAULT_CONFIG.useMock)),
      apiBaseUrl: runtime.apiBaseUrl || apiBaseFromStorage || DEFAULT_CONFIG.apiBaseUrl,
      requestTimeoutMs: Number(runtime.requestTimeoutMs || DEFAULT_CONFIG.requestTimeoutMs),
      authToken: runtime.authToken || tokenFromStorage || DEFAULT_CONFIG.authToken
    };
  }

  function ensureArray(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && Array.isArray(payload.items)) {
      return payload.items;
    }
    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
  }

  function ensureObject(payload) {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
        return payload.data;
      }
      return payload;
    }
    return {};
  }

  function joinUrl(baseUrl, path) {
    return String(baseUrl || '').replace(/\/$/, '') + path;
  }

  async function request(path, options) {
    var config = readConfig();
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, config.requestTimeoutMs);

    var headers = {
      'Content-Type': 'application/json'
    };
    if (config.authToken) {
      headers.Authorization = 'Bearer ' + config.authToken;
    }
    if (options && options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      var response = await fetch(joinUrl(config.apiBaseUrl, path), {
        method: (options && options.method) || 'GET',
        headers: headers,
        body: options && options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ' ' + response.statusText + ' @ ' + path);
      }
      var text = await response.text();
      return text ? JSON.parse(text) : {};
    } finally {
      clearTimeout(timer);
    }
  }

  async function bootstrapData() {
    var config = readConfig();
    if (config.useMock) {
      return {
        mode: 'mock',
        loaded: 0,
        failed: []
      };
    }

    if (!window.MockData) {
      window.MockData = {};
    }

    var fields = Object.keys(ENDPOINTS);
    var tasks = fields.map(function (field) {
      return request(ENDPOINTS[field])
        .then(function (payload) {
          if (field === 'currentUser') {
            window.MockData.currentUser = ensureObject(payload);
            return { field: field, ok: true };
          }
          window.MockData[field] = ensureArray(payload);
          return { field: field, ok: true };
        })
        .catch(function (error) {
          return { field: field, ok: false, error: error.message };
        });
    });

    var results = await Promise.all(tasks);
    var failed = results.filter(function (item) { return !item.ok; });
    return {
      mode: 'backend',
      loaded: results.length - failed.length,
      failed: failed
    };
  }

  window.DataOpsApi = {
    config: readConfig,
    endpoints: ENDPOINTS,
    get: function (path) { return request(path, { method: 'GET' }); },
    post: function (path, body) { return request(path, { method: 'POST', body: body }); },
    put: function (path, body) { return request(path, { method: 'PUT', body: body }); },
    remove: function (path) { return request(path, { method: 'DELETE' }); }
  };

  window.DataOpsBootstrap = bootstrapData;
})();