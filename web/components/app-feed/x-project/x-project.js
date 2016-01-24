(function() {
  'use strict';

  Polymer({
    is: 'x-project',

    behaviors: [XRouter.Routable],

    properties: {
      project: {
        type: Object
      },

      url: {
        type: String,
      },
    },

    sortByTimestamp: function(a, b) {
      a = moment(a.updated_at).unix();
      b = moment(b.updated_at).unix();

      if (a > b) return -1;
      if (a < b) return 1;

      return 0;
    },
  });
})();
