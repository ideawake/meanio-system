'use strict';

angular.module('mean-factory-interceptor', ['ngCookies'])
  .factory('httpInterceptor', ['$q', '$location', '$meanConfig', '$cookies', '$log',
    function($q, $location, $meanConfig, $cookies, $log) {
      return {
        'response': function(response) {
          if (response.status === 401) {
            $log.debug('response 401', response);
            $log.info('redirecting to loginPage', $meanConfig.loginPage);
            $location.url($meanConfig.loginPage);
            return $q.reject(response);
          }
          return response || $q.when(response);
        },
        'responseError': function(rejection) {
          if (rejection.status === 401) {
            $log.debug('responseError 401', rejection);
            // This is to set the cookie so that we can redirect back to the proper urL
            if(rejection.config.url !== '/api/login') {
              $log.debug('cookies for login redirect', $location.path());
              $cookies.put('redirect', $location.path());
            } else {
              $log.log('redirecting to loginPage', $meanConfig.loginPage);
              $location.url($meanConfig.loginPage);
            }
            return $q.reject(rejection);
          }
          return $q.reject(rejection);
        }
      };
    }
  ]).factory('noCacheInterceptor', function () {
      return {
        request: function (config) {
          // Don't cache GET reqs to /api/*, fix for IE
          if(config.method=='GET' && config.url.match(/api\//)) {
            var separator = config.url.indexOf('?') === -1 ? '?' : '&';
            config.url = config.url+separator+'noCache=' + new Date().getTime();
          }
          return config;
        }
      };
    })
  //Http Interceptor to check auth failures for XHR requests
  .config(['$httpProvider', '$provide',
    function($httpProvider, $provide) {
      $httpProvider.interceptors.push('httpInterceptor');
      $httpProvider.interceptors.push('noCacheInterceptor');
    }
  ]);
