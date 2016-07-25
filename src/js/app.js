angular.module('app', [
  'template-cache',
  'github-user-repositories'
])
  .config(function ($logProvider) {

    // @if environment='production'
    $logProvider.debugEnabled(false);
    // @endif

  });
