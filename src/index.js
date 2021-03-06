// Maybe allow nested `x-data`s. Automatically transform it into a component with an anonymous name, and replace it with a call to the component. 
// But should we pass down the whole scope v-bind="$attrs" and define all the props that we have data and computeds??? Or declare with with v-for="[data1,data2] in [[$parent.data1,$parent.data2]]"
// Either way will cause everything to be evaluated...


function init() {
    console.log("vue-alpine 0.1.3 initializing...")

    const findWithTag = (tag,fn) => Array.from(document.querySelectorAll(`*[${tag}]`)).forEach(fn)

    const walkDOM = function (node,func) {
      func(node)
      node = node.firstChild
      while(node) {
        walkDOM(node,func)
        node = node.nextSibling
      }
    }
  	
    // First fix some 10 x-tags to their v-tag equivalents
    // Supports everything but x-transition and x-spread
    // x-data and x-init will be done later in the code
    const renameAttribute = (a, b) => el => { el.setAttribute(b, el.getAttribute(a)); el.removeAttribute(a) }
    "x-show x-bind x-on x-model x-text x-html x-if x-for x-cloak".split(" ").forEach(tag => findWithTag(tag, renameAttribute(tag, 'v-'+tag.slice(2))))
    findWithTag('x-ref', renameAttribute('x-ref', 'ref'))
    
    // Special features
    if (false) findWithTag('x-let', el => {
      var varName = el.getAttribute("x-let")
      if (!varName.includes('=')) throw "x-let must be in the form `varName = expr`, but got: " + varName
      var expr = varName.substr(varName.indexOf("=")+1)
      varName = varName.substr(0, varName.indexOf("="))
      if (el.getAttribute("v-for")) throw "x-let cannot be used together with x-for"
      el.setAttribute("v-for", `${varName} in [${expr}]`)
      el.removeAttribute("x-let")
    })


    var els = []
    els.push(...document.querySelectorAll('*[x-component]'))
    els.push(...document.querySelectorAll('*[x-data]'))
    els.push(...document.querySelectorAll('*[x-opts]'))
    els = Array.from(new Set(els))
    
    // Search for arguments and modifiers
    const attrsWith = (el, attrName) => Array.from(el.attributes || []).filter(x=>x.name.startsWith(attrName+':')).map(a => {
    	const argParts = a.name.substr(attrName.length+1).split(".")
      const modifiers = argParts.slice(1)
      const arg = argParts[0]
      return {...a, arg, modifiers, value: a.value}
    })
    els.forEach(root => walkDOM(root, node => {
      
    	const xLets = attrsWith(node, 'x-let')
      // [vForKey, var1, var2] in arr.map(vForKey => [vForKey, expr1, expr2])
      if (!xLets.length) return;      
      const xVars = xLets.map(x=>x.arg)
      const xExprs = xLets.map(x=>x.value)      
      const oldVFor = node.getAttribute('v-for')
      if (oldVFor) { // Combine with existing v-for
        const oldVar = oldVFor.substr(0,oldVFor.indexOf(" in"))
        const oldExpr = oldVFor.substr(oldVFor.indexOf(" in")+3)
        node.setAttribute('v-for', `[${oldVar},${xVars}] in ${oldExpr}.map(${oldVar} => [${oldVar},${xExprs}])`)
      } else {
      	node.setAttribute('v-for', `[${xVars}] in [[${xExprs}]]`)
      }
      //alert(node.getAttribute('v-for'))
    }))
    
    // Now call the Vue constructor on each x-data
    els.forEach(el => {
    	const evalAsExpr = text => eval(`(${text})`) // forces expression, otherwise curly braces would be interpreted as a block, and function expressions as function declarations
      const getAttr = (attr, transform, dflt) => el.getAttribute(attr) ? transform(el.getAttribute(attr)) : dflt
      // A block to be executed as a function, with(this)
      const getFunc = body => evalAsExpr(`function() { with(this) { ${body} } }`)
      // An expression to be evaluated with(this)
      const getExprFunc = body => getFunc(`return (${body})`)
      // An expression, but if you start with ~ you get a block to return something from
      const getExprFuncEx = body => body.startsWith("~") ? getFunc(body.substr(1)) : getExprFunc(body)
      // The same but reversed
      const getExprFuncEx2 = body => !body.startsWith("~") ? getFunc(body.substr(1)) : getExprFunc(body)
      const getBothFunc = body => {
      	// An expression, but if it returns a function, it will be evaluated instead
      	const func = getExprFunc(body)
        return function() {
        	var result = func.apply(this)
          if (typeof result==='function') result = result.apply(this)
          return result
        }
      }
      
      const opts = getAttr("x-opts", evalAsExpr, {})
      opts.el = el
      //opts.$origHtml = el.outerHTML

      
      getAttr("x-data", data => opts.data = eval(`() => (${data})`))


      const xComputed = Array.from(el.attributes).filter(x=>x.name.startsWith('x-computed:'))
      opts.computed = {}
      xComputed.forEach(x => {
      	opts.computed[x.name.substr(11)] = getExprFuncEx(x.value)
      	//opts.computed[x.name.substr(11)] = getBothFunc(x.value)
      })

      getAttr('x-init', xInit => {
        const func = getExprFunc(xInit)
      	opts.created = function() {
          var result = func.apply(this)
          if (typeof result === 'function') this.$on('hook:mounted', result)
        }
      })

      // Activate it
      if (el.getAttribute('x-component')) {
        opts.name = el.getAttribute('x-component')
        opts.props = getAttr('x-props', eval, [])
        console.log("Registering component", opts.name, el)
        opts.template = el.innerHTML //'#'+el.getAttribute('id')
        delete opts.el
        Vue.component(opts.name, opts)
        el.remove()
      } else {
        console.log("Registering root element", el)
        new Vue(opts)
      }


    })

}

function onDocumentReady(fn) {
	if (document.readyState === "complete" || document.readyState === "interactive") {
		setTimeout(fn, 1);
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}   

// Export a function for module-importers to call if they like
export default function vueAlpineInitOnReady() { onDocumentReady(init) }

// In non-module environements (i.e. HTML page with a script tag), call our function now
if (typeof module == 'undefined') vueAlpineInitOnReady()

