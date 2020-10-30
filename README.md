# Description

[Vue](https://vuejs.org/) instances without any script, just like [alpine.js](https://github.com/alpinejs/alpine) but using the actual Vue library, with all of its abilities and none of the limitations of alpine.js.

- Supports nearly all [alpine.js directives](https://github.com/alpinejs/alpine/blob/master/README.md#use): [`x-data`](https://github.com/alpinejs/alpine/blob/master/README.md#x-data), [`x-init`](https://github.com/alpinejs/alpine/blob/master/README.md#x-init), [`x-show`](https://github.com/alpinejs/alpine/blob/master/README.md#x-show), [`x-bind`](https://github.com/alpinejs/alpine/blob/master/README.md#x-bind), [`x-on`](https://github.com/alpinejs/alpine/blob/master/README.md#x-on), [`x-model`](https://github.com/alpinejs/alpine/blob/master/README.md#x-model), [`x-text`](https://github.com/alpinejs/alpine/blob/master/README.md#x-text), [`x-html`](https://github.com/alpinejs/alpine/blob/master/README.md#x-html), [`x-if`](https://github.com/alpinejs/alpine/blob/master/README.md#x-if), [`x-for`](https://github.com/alpinejs/alpine/blob/master/README.md#x-for), [`x-cloak`](https://github.com/alpinejs/alpine/blob/master/README.md#x-cloak)
- Doesn't support `x-spread` or `x-transition` yet (but you can use freely Vue's [`<transition>` wrapper component](https://vuejs.org/v2/guide/transitions.html))
- Additionally supports [computed properties via `x-computed:propname="expression"`](#x-computed)
- Additionally supports [re-usable components via `x-component` and `x-props`](#x-component-and-x-props)
- Use [any other Vue option via `x-opts`](#x-opts)
- New experimental feature: [introduce variables via `x-let`](#x-let)

# Quick Start
```html
<div x-data="{ who: 'world' }">
  <div>Hello {{who}} from vue-alpine!</div>
</div>
<script src="https://unpkg.com/vue@2.x.x/dist/vue.js">
<script src="https://cdn.jsdelivr.net/gh/bandleader/vue-alpine@v0.x.x/dist/for-script-tag.min.js">
```

# More complex example
```html
<div x-data="{ who: 'world' }">
  <div><input x-model="who"></div>
  <div x-if="who">Hello, {{who}}!</div>
  <input type="button" @click="who=''" value="Clear">
</div>
```

# Special directives (beyond those in alpine.js)

### `x-computed`
```html
<div 
    x-data="{ who: 'world' }"
    x-computed:greeting="'Hello, ' + who + '!'"
    >
  {{greeting}}
</div>
```
You can have multiple `x-computed`s on a single element.

You can also pass a function:
```html
<div 
    x-data="{ who: 'world' }"
    x-computed:greeting="() => {
        return 'Hello, ' + who + '!'
    }"
    >
  {{greeting}}
</div>
```

### `x-component` and `x-props`
Re-usable Vue components:
```html
<template x-component="fancy-button" x-props="['bgcolor']">
    <button type="button" style="{background: bgcolor}"><slot /></button>
</template>
<div x-data>
    <fancy-button bgcolor="lightgreen">Green fancy button</fancy-button>
    <fancy-button :bgcolor="'yellow'">Yellow fancy button</fancy-button>
</div>
```
`x-props` is optional, and you can also Vue's object syntax for defaults and type validation.

### `x-opts`
Use any other Vue options you like:
```html
<div x-data="{name: ''}" x-opts="{
    watch: {
        name(newValue, oldValue) { console.log('Name was changed from', oldValue, 'to', newValue) }
    }
}">
</div>
```

### `x-let`
Experimental feature that lets you introduce a new variable into scope, so you don't have to type the whole computation (nor recompute it) every time you need it.
```html
<div x-for="custId in customerIds">
    <template x-let:customer="getCustomer(custId)">
        <div>{{customer.firstName}} {{customer.lastName}}</div>
    </template>
</div>
```
You can have multiple `x-let`s on a single element.