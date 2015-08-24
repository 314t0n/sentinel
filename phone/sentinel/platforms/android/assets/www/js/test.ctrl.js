 var testApp = angular.module('TestApp', []);

 testApp.controller('MainCtrl', function(deviceReady, $scope) {
     console.log('native start');
     /*deviceReady(function() {*/
         console.log('after deviceready');       
    /* });*/
 });

 /* http://briantford.com/blog/angular-phonegap */
 testApp.factory('deviceReady', function() {
     return function(fn) {

         var queue = [];

         var impl = function() {
             queue.push(Array.prototype.slice.call(arguments));
         };

         document.addEventListener('deviceready', function() {
             console.log('ezitt');
             queue.forEach(function(args) {
                 fn.apply(this, args);
             });
             impl = fn;
         }, false);

         return function() {
             return impl.apply(this, arguments);
         };
     };
 });