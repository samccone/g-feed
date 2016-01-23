(function() {
  Polymer({
    is: 'notification-detail',

    properties: {
      state: Object,
      stateProvider: Object,
    },

    hasActiveTarget: function(activeTarget) {
      return activeTarget !== undefined;
    },

    removeActiveTarget: function() {
      this.stateProvider.removeActiveTarget();
    },
  });
})();
