(function() {
  'use strict';

  class Path {
    // https://gist.github.com/creationix/7435851
    // Joins path segments.  Preserves initial '/' and resolves '..' and '.'
    // Does not support using '..' to go above/outside the root.
    // This means that join('foo', '../../bar') will not resolve to '../bar'
    static join() {
      // Split the inputs into a list of path commands.
      var parts = [];
      for (var i = 0, l = arguments.length; i < l; i++) {
        parts = parts.concat(arguments[i].split('/'));
      }
      // Interpret the path commands to get the new resolved path.
      var newParts = [];
      for (i = 0, l = parts.length; i < l; i++) {
        var part = parts[i];
        // Remove leading and trailing slashes
        // Also remove '.' segments
        if (!part || part === '.') {
          continue;
        }
        // Interpret '..' to pop the last segment
        if (part === '..') {
          newParts.pop();
        }
        // Push new path segments.
        else {
          newParts.push(part);
        }
      }
      // Preserve the initial slash if there was one.
      if (parts[0] === '') {
        newParts.unshift('');
      }
      // Turn back into a single string path.
      return newParts.join('/') || (newParts.length ? '/' : '.');
    }

    // A simple function to get the dirname of a path
    // Trailing slashes are ignored. Leading slash is preserved.
    static dirname(path) {
      return Path.join(path, '..');
    }
  }

  // An ElementProxy is essentially a router.js handler object which proxies
  // all of its lifecycle callbacks to an element instance that it manages.
  // It's in charge of creating, adding, and removing the element from the DOM
  // Many of the lifecycle callbacks return promises which will cause the
  // router to wait until the promise is resolved before advancing to the
  // next lifecycle callback
  class ElementProxy {
    constructor(router, tagName, importURI, into, outlet) {
      this.router = router;
      this.tagName = tagName;
      this.importURI = importURI;
      this.into = into;
      this.outlet = outlet;
    }

    beforeModel(transition) {
      console.log('beforeModel', this.tagName);

      // If the element already exists then it's in the document and
      // just receiving new data. In that case just poke the element
      // and return
      if (this.element) {
        return this.element.beforeModel();
      }

      // If the element doesn't already exist check if it needs to be imported
      // import it, and instantiate it
      return this.getElement(this.tagName, this.importURI)
        .then(instance => {
          this.element = instance;
          this.element.router = this.router;
          return this.element.beforeModel(transition);
        })
        .catch((err) => {
          console.error('Unable to find element ' + err);
          throw err;
        });
    }

    getElement(tagName, importURI) {

      const promise = new RSVP.Promise((resolve, reject) => {
        // Check if element definition is registered, if not import it
        let test = document.createElement(tagName);
        // Custom Element definition has not been registered yet
        if (test.constructor === HTMLElement) {
          Polymer.Base.importHref(importURI, () => {
            resolve(document.createElement(tagName));
          }, reject);
          // Custom Element has already been registered, return test element
        } else {
          resolve(test);
        }
      });

      return promise;

    }

    model(params, transition) {
      console.log('model', this.tagName);
      return this.element.model(params, transition);
    }

    afterModel(model, transition) {
      console.log('afterModel', this.tagName);
      return this.element.afterModel(model, transition);
    }

    serialize(context) {
      console.log('serialize', this.tagName);
      return this.element.serialize(context);
    }

    // TODO: This callback is doing a fair bit of work trying to sort out
    // where to render the element. Might be better to factor this out?
    enter(model) {
      console.log('enter', this.tagName);

      let parent;
      switch (this.into.constructor) {

        // The user passed in a CSS selector using the `into` attribute
        case String:
          parent = document.querySelector(this.into);
          if (!parent) {
            throw new Error(
              'Unable to find element referenced by into attribute' + this.into
            );
          }
          break;

        // If the user didn't specify where to render with an `into` attribute
        // then we're falling back to the parent ElementProxy and rendering to its
        // DOM node
        case ElementProxy:
          parent = this.into.element;
          break;

        // If the value is `document.body` then this is the root route defaulting
        // to the body element as its parent.
        case HTMLBodyElement:
          parent = this.into;
          break;

        default:
          throw new Error('Invalid intro attribute value of', this.into);
      }

      // Before appending the element check to see if it should go in an outlet
      if (this.outlet) {
        this.element.classList.add(this.outlet);
      }

      Polymer.dom(parent).appendChild(this.element);
      return this.element.enter(model);
    }

    setup(model, transition) {
      console.log('setup', this.tagName);
      return this.element.setup(model, transition);
    }

    exit() {
      console.log('exit', this.tagName);
      return this.element.exit()
        .then(() => {
          return this.remove();
        })
        .catch((err) => {
          console.error(err);
          throw err;
        });
    }

    remove() {
      console.log('remove', this.tagName);
      const promise = new RSVP.Promise((resolve, reject) => {
        try {
          this.element.remove();
          this.element = null;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      return promise;
    }
  }

  window.ElementProxy = ElementProxy;

  Polymer({

    is: 'x-router',

    observers: [
      '_urlChanged(path, query, hash)'
    ],

    _urlChanged: function(path, query, hash) {
      this.debounce('_urlChanged', function() {
        var url = path;
        url = query ? url + '?' + query : url;
        url = hash ? url + '#' + hash : url;

        // Tell the router to execute a handler based on URL change
        if (this.router) {
          this.router.handleURL(url)
            .catch(function(err) {
              if (err.name === 'UnrecognizedURLError') {
                console.log('Can\'t find', err.message);
              }
            });
        }
      });
    },

    created: function() {
      this.router = new Router.default();
      this.baseDir = this.getAttribute('base') || './';
      if (!this.firstElementChild) {
        return;
      }
      // Currently walking the tree 3 times (once for each of these steps)
      // It may be ideal to condense it all into one walk but might make
      // the code more confusing
      this.tree = this._createTree(this.firstElementChild);
      this._registerRoutes(this.tree);
      this.proxies = this._createProxies(this.tree);

      // Fetch a handler for the router
      this.router.getHandler = (name) => {
        return this.proxies[name];
      };

      // Tell iron-page-url to update the URL in response to a router update
      this.router.updateURL = (url) => {
        var updated = new URL(url, window.location.origin);
        // Currently iron-page-url doesn't really have a way to pass
        // the entire URL around. You have to break it into pieces :\
        this.$.url.path = updated.pathname;
        this.$.url.query = updated.search;
        this.$.url.hash = updated.hash;
      };
    },

    _createTree: function(base) {
      let tree = [];

      function walk(element, cb, children) {
        let node = cb(element);
        children.push(node);
        element = element.firstElementChild;
        if (element) {
          children = node.children;
          // A weird quirk of router.js is that you have to have nested index routes
          // For example:
          // match('/').to('home', function() {
          //   match('/').to('homeIndex');
          // });
          // Because this would make the declarative version a little wonky we will
          // create an implicit noop and use it for index routes.
          // TODO: The user should be able to override this.
          children.push({
            path: '/',
            component: 'noop',
            name: 'noop',
            into: null,
            outlet: null,
            children: []
          });
        }
        while (element) {
          walk(element, cb, children);
          element = element.nextElementSibling;
        }
      }

      walk(base, function(element) {
        // TODO: Maybe we can just use a content element to filter the children
        // instead of checking nodeName?
        if (element.nodeName !== 'X-ROUTE') {
          throw new Error('x-router can only accept x-route children');
        }

        let path = element.getAttribute('path');
        let component = element.getAttribute('component');
        let name = element.getAttribute('name') || component;
        let into = element.getAttribute('into');
        let outlet = element.getAttribute('outlet');
        let children = [];

        return {
          path: path,
          component: component,
          name: name,
          into: into,
          outlet: outlet,
          children: children
        };

      }, tree);

      return tree;
    },

    // TODO: Clean up this recursion
    _registerRoutes: function(tree) {
      function getNestedRoutes(children) {
        if (!children || !children.length) {
          return;
        }

        return function(match) {
          children.forEach(function(child) {
            match(child.path).to(child.name, getNestedRoutes(child.children));
          });
        };
      }

      function register(match, tree) {
        tree.forEach(function(branch) {
          match(branch.path).to(branch.name, getNestedRoutes(branch.children));
        });
      }

      this.router.map(function(match) {
        register(match, tree);
      });
    },

    // TODO: Clean up this recursion
    _createProxies: function(tree) {
      const proxies = {};
      let router = this.router;
      let baseDir = this.baseDir;

      function walkTree(node, parent) {
        // Handle implicit noop index routes
        if (node.name === 'noop') {
          return;
        }
        // TODO: !!! This is horrible fix it!
        let proxy = new ElementProxy(
          router,
          node.component,
          Path.join(baseDir, node.component, node.component + '.html'),
          node.into || parent,
          node.outlet
        );
        proxies[node.name] = proxy;
        if (node.children && node.children.length) {
          node.children.forEach(function(child) {
            walkTree(child, proxy);
          });
        }
      }

      tree.forEach(function(branch) {
        walkTree(branch, document.body);
      });

      // Ensure that there's a noop component available
      return Object.assign({}, {
        noop: {}
      }, proxies);
    }

  });

}());
