Maestro is a light weight, succinctly written framework for managing global application state
and common patterns within react native applications in an organized manner. It is written to be performant and highly flexible.

### Installation

```
npm install --save react-native-maestro
```

### Features

* Manage state in a more organized way using maestro Managers.
* Abstract application logic into flows for better code organization.
* Extremely light weight with no 3rd party dependencies.
* Robust and extensible.
* Do more with less, no extensive setup required.

# Overview


### Global State

Maestro takes an organizationally focused approach to global state management. The global state store at it's core is simply a plain object with properties. Each property of the global state store is associated with a Maestro manager you write for your application. Maestro managers are responsible for managing a given piece of the global state and exposing ways to interact with it.

### Managers

Managers implement all of the methods for interacting with the given piece of global state store they're responsible for.

### Flows

Flows are a way to manage temporary state using a store separate from the global state store and abstract associated application logic into a single place. Flows are great for places you may need to track state across many screens or components or have an expected flow of actions across many components. Flows can interact with managers of the global state incrementally or all at once to commit flow state to managed global state.

### Helpers

Helpers are just that, a way to break apart monotonous pieces of logic used across many managers / flows or your application. An example of what to use a helper for could be an abstraction class for interaction with your application's API, or perhaps methods for managing cached media - they're open ended and flexible to be used for whatever you may need.

# Using Maestro


### Organizing Maestro Within Your Project

We recommend adding a `maestro` directory to the top level directory of your application or source directory depending on your projects existing structure.

A `maestro` directory is best structured as follows.

```
maestro
|- flows
|---- ... Your Maestro flows
|- helpers
|---- ... Your Maestro helpers
|- managers
|---- ... Your Maestro managers
|- index.js
```

### Creating your `maestro` index.js file.

Your `index.js` file in your `maestro` directory is the kickoff point of your Maestro implementation.

This file should import your Maestro flows, helpers, and managers and export a new Maestro instance. Here's an example of a common `index.js` file.

```javascript
import { Maestro } from 'react-native-maestro';
import flowClasses from './flows';
import helperClasses from './helpers';
import managerClasses from './managers';

export default new Maestro({
  flowClasses,
  helperClasses,
  managerClasses,
});

```

It's best practice for your `flows`, `helpers` and `managers` directory to include their own `index.js` files that export an array of the corresponding `flows`, `helpers` or `managers` within their respective directories. This pattern is assumed in the Maestro `index.js` example above.

### Creating a Maestro manager

Maestro managers manage a single piece of the global maestro state and provide organized methods for interacting, manipulating and accessing.

Here's an example of a manager for managing a `user` in the global state.

```javascript
import { Manager } from 'react-native-maestro';

class UserManager extends Manager {
	static get name() { // Required
    	return 'userManager'; // Associates this manager to our maestro instance, accessible via maestro.managers.userManager, maestro is our maestro instance in this exampel
    }

    static initialStore = { // Optional, sets the initial store this manager manages.
    	name: '',
        email: '',
        age: 0,
        gender: '',
    }

    constructor(maestro) {
    	super(maestro);

        // some constructor logic, whatever you want.
    }

    get storeName() { // Required
    	return 'user'; // If we need to access the global store, this is the property this manager will export it's managed store out to within the global store. IE: maestro.store.user
    }

    login() { // Example method, you can write your own
    	someExampleLoginRequest().then(exampleResult => {
        	this.updateStore({
            	name: exampleResult.name,
                age: exampleResult.age
            });

            // ^ This would result in the store becoming
            // {
            //  	name: // whatever exampleResult.name was
            //		email: '',
            //		age: // whatever exampleResult.age was
            //		gender: ''
            // }
        });
    }

    // other methods.. logout? etc, you're free to define
}

export default UserManager;
```

### Creating a Maestro Flow

Let's define an example flow that are application can use to track state across screens in an organized manner, and eventually commit the result of the user's action across these screens to the global state.

Flows are accessible using your `maestro` instance's `startFlow()`, `progressFlow()` and `finishFlow()` methods.

```javascript
import { Flow } from 'react-native-maestro';

class LoginRegisterFlow extends Flow {
  static get name() { // required, when starting a flow from your maestro instance, this is the name used.
    return 'loginRegisterFlow';
  }

  static initialStore = { // Optional, sets the initial temporary store this flow uses.
    email: null,
    password: null,
    loading: false,
    errors: null,
  }

  start() { // optional, called when maestro starts this flow.

  }

  progress({ email, password }) {
    const { navigationHelper } = this.maestro.helpers;
    const storeUpdate = { errors: null };

    if (email) {
      const validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);

      storeUpdate.email = email;
      storeUpdate.errors = (!validEmail) ? { emailScreen: 'email is invalid' } : null;

      this.updateStore(storeUpdate);

      if (validEmail) {
        return navigationHelper.push('password', { backEnabled: true });
      }
    }

    if (password) {
      const validPassword = (password.length > 3);

      storeUpdate.password = password;
      storeUpdate.errors = (!validPassword) ? { passwordScreen: 'password too short' } : null;

      this.updateStore(storeUpdate);

      if (validPassword) {
        this.maestro.finishFlow('loginRegisterFlow');
      }
    }
  }

  finish() {
    const { userManager } = this.maestro.managers; // All managers have access to the root maestro instance.
    const { email, password } = this.store;

    this.updateStore({ loading: true }); // update it's own temporary store.

    userManager.doSomething(email, password); // doSomething() might commit email / password to their managed store.
  }
}

export default LoginRegisterFlow;

```

### Creating a Maestro helper

Sometimes we might want to abstract the navigation logic of our application into a single place, in this example we use the `react-navigation` library, but we want to abstract up all of it's features for handling navigation into a single place instead of each screen component. Here's how we might do that with a Maestro helper.

```javascript
import { Helper } from 'react-native-maestro';
import { NavigationActions, StackActions } from 'react-navigation';

class NavigationHelper extends Helper {
  static get name() {
    return 'navigationHelper';
  }

  _navigator = null;

  navigate(routeName, params) {
    this._navigator.dispatch(
      NavigationActions.navigate({
        type: 'Navigation/NAVIGATE',
        routeName,
        params,
      }),
    );
  }

  push(routeName, params) {
    this._navigator.dispatch(
      StackActions.push({ routeName, params })
    );
  }

  pop() {
    this._navigator.dispatch(
      StackActions.pop({ n: 1 })
    );
  }

  popToTop() {
    this._navigator.dispatch(
      StackActions.popToTop()
    );
  }

  reset(routeName, params) {
    this.maestro.dispatchEvent('NAVIGATION_RESET', { routeName, params });
  }

  dispatchNavigationStateChangeEvent = (previousState, currentState) => {
    const { routeName } = currentState.routes[currentState.routes.length - 1];
    const event = (currentState.isTransitioning) ? 'SCREEN_WILL_APPEAR' : 'SCREEN_DID_APPEAR';

    this.maestro.dispatchEvent(event, { screen: routeName });
  }

  setNavigator(navigator) {
    this._navigator = navigator;
  }
}

export default NavigationHelper;

```

# Documentation

### `Maestro` class

`constructor(options)` - IE `new Maestro({ ... flows, managers, etc })`
* `options` - An object that may include any of the following properties.
	* `flows` - an array of Flow classes.
	* `managers` - an array of Manager classes.
	* `helpers` - an array of Helper classes.


`store` - A property for accessing the global store.


`flows` - A property for accessing active flows by name.


`managers` - A property for accessing state store managers by name.


`helpers` - A property for accessing helpers by name.


`link(classInstance)` - Link an instance or object to receive global state store updates and events. `classInstance` will need to implement the `receiveStoreUpdate(newStore)` method to receive global state store updates and `receiveEvent(eventName, eventData)` to receive global events. Typically you'll use this in `componentDidMount` of a component you may want to link.
* `classInstance` - The class instance or object to link that implements `receiveEvent()` or `receiveStoreUpdate()`.


`unlink(classInstance)` - Unlink an instance or object from receiving global store updates and events.
* `classInstance` - The class instance or object to unlink.


`dispatchEvent(eventName, eventValue)` - Dispatches an event to all objects or class instances that were linked using globally to your maestro instance using `link()`. `receiveEvent()` will be invoked on these objects or class instances if available.
* `eventName` - The name of the event, passed directly to any linked class instance or object's `receiveEvent` method.
* `eventValue` - The optional value of the event, passed directly to any linked class instance or object's `receiveEvent` method.


`startFlow(flowName, data)` - Starts a flow that is available through your maestro instance. If your flowName is userRegister, it'd be accessible at `maestro.flows.userRegister`
* `flowName` - The name of the flow to start, this corresponds to the value returned by a flow's `static get name() { ... }`
* `data` - Optional data passed to the `start()` method of the initialized flow.


`progressFlow(flowName, data)` - Progress a flow and pass `data` to it.
* `flowName` - The name of the flow to progress.
* `data` - The data to pass to the `progress()` method of the flow.


`finishFlow(flowName, data)` - Finish a flow and optionall pass `data` to it's `finish()` method.
* `flowName` - The name of the flow to finish.
* `data` - The data to pass to the `finish()` method of the flow.


`linkToFlow(flowName, classInstance)` - Just like the global state store being able to dispatch updates, flows can also dispatch updates. You can link a class instance / object to receive events or temporary state store updates from a flow. Updates are received just the same by implementing a `receiveStoreUpdate()` or `receiveEvent()` method. However, when these methods are invoked they'll receive an additional argument specifying the flow name the update is from.
* `flowName` - The name of the flow to link the classInstance / object to.
* `classInstance` - The class instance to link.


`unlinkFromFlow(flowName, classInstance)` - Unlinks a class instance or object from flow updates.
* `flowName` - The name of the flow to unlink the class instance / object from.
* `classInstance` - The class instance or object to unlink.


### `Flow` class

`static get name()` - The globally identifiable name of the flow. This must return a string.


`store` - A property for accessing the flow's state store.


`link(classInstance)` - Link an instance or object to receive flow specific state store updates and events. `classInstance` will need to implement the `receiveStoreUpdate(newStore)` method to receive flow specific state store updates and `receiveEvent(eventName, eventData)` to receive flow specific events. Typically you'll use this in `componentDidMount` of a component you may want to link.
* `classInstance` - The class instance or object to link that implements `receiveEvent()` or `receiveStoreUpdate()`.


`unlink(classInstance)` - Unlink an instance or object from receiving flow specific store updates and events.
* `classInstance` - The class instance or object to unlink.


`dispatchEvent(eventName, eventValue)` - Dispatches an event to all objects or class instances that were linked using to your flow using `link()`. `receiveEvent()` will be invoked on these objects or class instances if available.
* `eventName` - The name of the event, passed directly to any linked class instance or object's `receiveEvent` method.
* `eventValue` - The optional value of the event, passed directly to any linked class instance or object's `receiveEvent` method.


`updateStore(object)` - Updates the flow's store using shallow merge and notifies all linked class instances / objects of a flow specific state store change by invoking their `receiveStoreUpdate()` method.
* `object` - The object to shallow merge against the flow's current state store.


`start(data)` - A lifecycle method of flows, when a flow starts this will be invoked with any optionally included `data`. This should not be invoked directly.
* `data` - An optional data object included from `maestro.startFlow()`.


`progress(data)` - A lifecycle method of flows, when a flow progresses this will be invoked with included `data` to progress the flow. This should not be invoked directly.
* `data` - A data object included from `maestro.progressFlow()`.


`finish(data)` - A lifecycle method of flows, when a flow finishes this will be invoked with any optionally included `data`. This should not be invoked directly.
* `data` - An optional data object included from `maestro.finishFlow()`.


### `Manager` class



### `Helper` class



### linked instances / object methods

`receiveStoreUpdate()`

`receiveEvent()`
