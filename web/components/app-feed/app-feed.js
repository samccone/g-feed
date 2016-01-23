(function() {
  'use strict';

  Polymer({
    is: 'app-feed',

    properties: {
      state: Object,
      stateProvider: Object,
    },

    groupNotificationsByProject: function(notifications) {
      notifications = notifications || [];
      let ret = [];

      let projectMap = notifications.reduce((prev, curr) => {
        let repo = curr.repository.full_name;

        if (prev[repo]) {
          prev[repo].push(curr);
        } else {
          prev[repo] = [curr];
        }

        return prev;
      }, {});

      for (let project in projectMap) {
        ret.push({
          name: project,
          notifications: projectMap[project]
        });
      }

      return ret;
    },

    getNotifications: function(notifications) {
      return this.groupNotificationsByProject(notifications.base);
    },
  });
})();
