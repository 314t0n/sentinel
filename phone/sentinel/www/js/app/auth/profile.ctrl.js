(function() {

    var injectParams = ['config', '$scope', '$localStorage', 'authService', 'BroadcastService', 'cameraFactory'];

    var profileCtrl = function(config, $scope, $localStorage, authService, BroadcastService, cameraFactory) {

        $scope.loading = true;

        $scope.notificationStatus = true;

        var uuid = 'test';

        var user = null;

        function loadUUID(success, error) {
            if (typeof window.plugins !== 'undefined') {
                if (typeof window.plugins.uniqueDeviceID !== 'undefined') {
                    window.plugins.uniqueDeviceID.get(success);
                }
            }
        }

        function loadUserData(uuid) {

            authService.me(function(data) {

                user = data.user;

                console.log('user.devices[uuid]');
                console.log(user.devices[uuid]);

                if (typeof user.devices !== 'undefined') {
                    if (typeof user.devices[uuid] !== 'undefined') {

                        $scope.notificationStatus = user.devices[uuid] == 'true';

                    }
                }

                $scope.loading = false;

            });

        }

        loadUserData(1);

        loadUUID(function(id) {
            uuid = id;          
            console.log(uuid);
            loadUserData(uuid);
        });

        var firstLoad = true;
        //@todo unbind
        $scope.$watch('notificationStatus', function() {

            if ($scope.loading) {
                return;
            }

            if (firstLoad) {
                firstLoad = false;
                return;
            }

            var data = {
                'uuid': uuid,
                'value': $scope.notificationStatus
            };

            authService.save(data);

            if ($scope.notificationStatus) {

                console.log('start')

                cameraFactory.get({}, function(data) {
                    console.log('cameraFactory')
                    console.log(data.cameras.length)
                    BroadcastService.start(data.cameras);
                });

            } else {
                console.log('stop')
                BroadcastService.stop();
            }

        });

        $scope.logout = function() {
            authService.logout(function() {
                authService.redirectToLogin();
            });
        }

    }

    profileCtrl.$inject = injectParams;

    sentinelApp.controller('ProfileIndexCtrl', profileCtrl);

})();