(function() {
  Polymer({
    is: 'state-provider',

    properties: {
      state: Object,
    },

    getNotifications: function(notifications) {
      return notifications;
    },

    fetchLatestNotifications: function() {
      this.set('state.notifications', stub)
    },

    getExternalLink: function(url) {
      //todo make this work
      //https://api.github.com/repos/cucumber/cucumber-html/issues/comments/171642105
      //https://api.github.com/repos/Polymer/polymer/pulls/3311
      //https://api.github.com/repos/yeoman/generator-polymer/releases/2442471

      return url;
    },

    setActiveTarget: function(id) {
      this.set('state.activeTarget', id);
    },

    removeActiveTarget: function() {
      this.set('state.activeTarget', undefined);
    },
  });
})();
