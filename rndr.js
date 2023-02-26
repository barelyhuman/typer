/* 
Reactive library 
Borrows concepts from the below 
https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p
https://vuejs.org/guide/extras/reactivity-in-depth.html

The concept is to be able to self handle effects and also to be array and object focused 
instead of primitives. 

This might further move into a proper view library for now it's just the base reactivity layer
*/

const activeEffects = [];

function subscribe(key, running, subscriptions) {
  let _key = key || "all";
  if (!subscriptions[_key]) {
    subscriptions[_key] = new Set();
  }
  subscriptions[_key].add(running);
  running.dependencies.add(subscriptions);
}

export function reactive(obj) {
  const subscriptions = {};

  return new Proxy(obj, {
    get(target, prop) {
      const runningEffect = activeEffects[activeEffects.length - 1];
      if (runningEffect) subscribe(prop, runningEffect, subscriptions);
      return Reflect.get(...arguments);
    },
    set(target, prop, value, obj) {
      const _key = prop || "all";
      const subs = subscriptions[_key] || [];
      const changed = Reflect.set(...arguments);
      for (const sub of [...subs]) {
        sub.run();
      }
      return changed;
    },
  });
}

function removeDeps(running) {
  for (const deps of running.dependencies) {
    Object.keys(deps).forEach((k) => {
      deps[k].forEach((dep) => {
        dep.dependencies.delete(running);
      });
    });
  }
  running.dependencies.clear();
}

export function effect(fn) {
  const effect = {
    run() {
      removeDeps(effect);
      activeEffects.push(effect);
      let _fnCleanup;
      try {
        _fnCleanup = fn();
      } finally {
        if (_fnCleanup) {
          Promise.resolve(_fnCleanup()).then(() => removeDeps(effect));
        }
        activeEffects.pop();
      }
    },
    dependencies: new Set(),
  };

  effect.run();
}
