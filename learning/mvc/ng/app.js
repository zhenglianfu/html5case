/**
 * Created by zhenglianfu on 2016/3/13.
 */
    // top namespace
var $app = angular.module('app', [function(){
    console.log('powered by fuzl');
}]);
console.log($app);
$app.controller('RootController', function($scope){
    $scope.person = {};
}).controller('ChildController', function($scope){
    $scope.person.name = 'angular';
    console.log($scope);
}).controller('TopController', function($scope){
    console.log($scope);
}).controller('FormController', ['$scope', function($scope){
    $scope.user = {};
    $scope.submit = function(){
        console.log($scope);
    };
}]).controller('IncludeController', ['$scope', function ($scope) {
    $scope.templateUri = './template/datepicker.html';
}]);
$app.directive('ensureUnique', function(){
    return {
        require: 'ngModel',
        link: function(scope, ele, attrs, c){
            console.log(attrs.ngModel);
        }
    }
});