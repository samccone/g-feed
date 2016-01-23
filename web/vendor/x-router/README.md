# x-router

An easy to use router for Polymer apps, built on top of [router.js](https://github.com/tildeio/router.js/)

In router.js, a route is matched to a handler object containing transition callbacks.
In x-router, your components _become the handler objects_, allowing you to easily manage loading data and binding it to UI.

## Install

```
bower install --save robdodson/x-router
```

## Usage

### Setup your routes

Easily map the structure of your components to your URLs. Nested routes will append
their component to the parent route's component as a child. When a route is matched
it will check to see if its component definition is already loaded, if not it will
lazily import the definition before adding the element to the page.

```html
<x-router>
  <x-route path="/" component="x-app" name="home">
    <x-route path="/posts" component="x-posts" name="posts">
      <x-route path="/:id" component="x-post" name="post"></x-route>
    </x-route>
  </x-route>
</x-router>
```

### Add lifecycle callbacks

The router will parse the URL for parameters and then pass the parameters into the component's model method. It will then pass the return value of model into the setup method. These two steps are broken apart to support async loading via promises. The router will not call setup until the promise returned from model has resolved. This is a very useful
pattern, especially for nested routes.

```js
Polymer({
  is: 'x-posts',
  behaviors: [XRouter.Routable],
  model: function(params) {
    return fetch(`/data/${params.category}.json`)
      .then(response => {
        return response.json();
      });
  },
  setup: function(model) {
    this.posts = model.posts;
  }
});
```

### Generate links to other routes

Generate links to other named routes using computed bindings. Additional
arguments passed to the generate function will be turned in to route parameters.

```html
<a href="[[generate(router, 'posts', 123)]]"></a>
<!-- produces /posts/123 -->
```

## Route Elements

### Basic Routes

```html
<x-router>
  <x-route path="/" component="x-app"></x-route>
  <x-route path="/users/:id" component="x-users"></x-route>
  <x-route path="/favorites" component="x-favorites"></x-route>
</x-router>
```

### Named Routes

```html
<x-router>
  <x-route path="/" component="x-app" name="home"></x-route>
  <x-route path="/users/:id" component="x-users" name="users"></x-route>
  <x-route path="/favorites" component="x-favorites" name="favorites"></x-route>
</x-router>
```

### Nested Routes

```html
<x-router>
  <x-route path="/" component="x-app" name="home">
    <x-route path="/messages" component="x-inbox" name="inbox">
      <x-route path="/:id" component="x-message" name="message"></x-route>
    </x-route>
  </x-route>
</x-router>
```

### Outlets

```html
<body is="my-app">
  <h1>Inbox</h1>
  <x-inbox>
    #content[select=".list"]
      <x-messages class="list"></x-messages>
    #content[select=".preview"]
      <x-message class="preview"></x-message>
  </x-app>
</body>

<x-router>
  <x-route path="/messages" component="x-messages" name="messages" into="x-inbox" outlet="list">
    <x-route path="/:id" component="x-message" name="message" into="x-inbox" outlet="preview"></x-route>
  </x-route>
</x-router>
```

## Lifecycle Callbacks

[router.js](https://github.com/tildeio/router.js/) provides a number of useful handler callbacks which can be mixed in
to your element using the Routable behavior. Most lifecycle callbacks can return a promise
which will prevent the router from continuing until the promise has resolved.

### beforeModel(transition)

Called before model is called, or before the passed-in model is attempted to be resolved. It receives a transition as its sole parameter (see below).

### model(params, transition)

The value returned from the model callback is the model object that will eventually be supplied to setup (described below) once all other routes have finished validating/resolving their models. It is passed a hash of URL parameters specific to its route that can be used to resolve the model.

model will be called for every newly entered route, except for when a model is explicitly provided as an argument to transitionTo

### afterModel(model, transition)

Called after model is called, or after the passed-in model has resolved. It receives both the resolved model and transition as its two parameters.

### serialize(context)

serialize should be implemented on as many handlers as necessary to consume the passed in contexts, if the transition occurred through transitionTo. A context is consumed if the handler's route fragment has a dynamic segment and the handler has a model method.

### enter(model)

Called when the handler becomes active, not when it remains active after a change

### setup(model, transition)

Called when the handler becomes active, or when the handler's context changes

### exit()

Called when the handler is no longer active

For a more detailed explanation of transition callbacks, see [the router.js docs](https://github.com/tildeio/router.js/#transition-callbacks).

## Generating URLs

```html
<a href="[[generate(router, 'users', 123)]]">User123</a>
```
