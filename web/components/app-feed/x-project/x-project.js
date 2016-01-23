(function() {
  'use strict';

  Polymer({
    is: 'x-project',

    properties: {
      state: Object,

      stateProvider: Object,

      project: Object,
    },

    sortByTimestamp: function(a, b) {
      a = moment(a).unix();
      b = moment(b).unix();

      if (a > b) return -1;
      if (a < b) return 1;

      return 0;
    },
  });
})();
