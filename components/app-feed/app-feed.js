(function() {
  Polymer({
    is: 'app-feed',

    properties: {
      state: Object,
      stateProvider: Object,
    },

    getNotifications: function(notifications) {
      return notifications.base;
    },
  });
})();
