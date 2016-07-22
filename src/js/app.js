const

  app = angular.module('app', [
    'template-cache',
    'github-user-repositories'
  ])
    .config(['$logProvider', function ($logProvider) {
      $logProvider.debugEnabled(false);
    }]);
