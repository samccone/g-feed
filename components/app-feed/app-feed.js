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

    setActiveTarget: function(e) {
      this.stateProvider.setActiveTarget(e.model.item.id);
    },
  });
})();
