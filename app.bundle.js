(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{"./index.tsx":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n("./node_modules/react/index.js"),i=n("./node_modules/react-dom/index.js"),s=n("./src/index.ts");i.render(r.createElement(s.ChellVizApp,null),document.getElementById("app-root"))},"./src/ChellVizApp.tsx":function(e,t,n){"use strict";var r=this&&this.__extends||function(){var e=function(t,n){return(e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(t,n)};return function(t,n){function r(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}}();Object.defineProperty(t,"__esModule",{value:!0});var i=n("./node_modules/react/index.js"),s=n("./node_modules/semantic-ui-react/dist/es/index.js"),o=n("./src/container/index.ts"),a=n("./src/data/index.ts"),c=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return r(t,e),t.prototype.render=function(){return i.createElement("div",{id:"ChellVizApp"},i.createElement(s.Grid,{centered:!0,divided:"vertically"},i.createElement(s.GridRow,null,i.createElement(o.ProteinFeatureViewer,null)),i.createElement(s.GridRow,null,i.createElement(o.VizPanelContainer,{dataDirs:["hpc/full"].map(function(e){return"assets/datasets/"+e}),initialVisualizations:[a.VIZ_TYPE["T-SNE"],a.VIZ_TYPE.SPRING,a.VIZ_TYPE["T-SNE-FRAME"]],supportedVisualizations:[a.VIZ_TYPE["T-SNE"],a.VIZ_TYPE.SPRING,a.VIZ_TYPE["T-SNE-FRAME"]],numPanels:3})),i.createElement(s.GridRow,null,i.createElement(o.VizPanelContainer,{dataDirs:["assets/beta_lactamase","assets/5P21","assets/P01112"],supportedVisualizations:[a.VIZ_TYPE.CONTACT_MAP,a.VIZ_TYPE.NGL],initialVisualizations:[a.VIZ_TYPE.CONTACT_MAP,a.VIZ_TYPE.NGL],numPanels:2}))))},t}(i.Component);t.ChellVizApp=c},"./src/index.ts":function(e,t,n){"use strict";function r(e){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])}Object.defineProperty(t,"__esModule",{value:!0}),r(n("./src/component/index.ts")),r(n("./src/container/index.ts")),r(n("./src/context/index.ts")),r(n("./src/data/index.ts")),r(n("./src/helper/index.ts")),r(n("./src/hoc/index.ts")),r(n("./src/ChellVizApp.tsx"))}},[["./index.tsx",4,1,0]]]);