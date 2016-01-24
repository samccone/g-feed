(function() {
  Polymer({
    is: 'notification-detail',

    behaviors: [XRouter.Routable],

    hasActiveTarget: function(activeTarget) {
      return activeTarget !== undefined;
    },

    removeActiveTarget: function() {
      //todo
    },
  });
})();
