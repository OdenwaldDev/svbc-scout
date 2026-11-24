//# sourceMappingURL=opentype.min.js.map
"use strict";var BD_SVGPATH=(()=>{var A=(t,i)=>()=>(i||t((i={exports:{}}).exports,i),i.exports);var V=A((wt,U)=>{"use strict";var X={a:7,c:6,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,z:0},$=[5760,6158,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8239,8287,12288,65279];function tt(t){return t===10||t===13||t===8232||t===8233||t===32||t===9||t===11||t===12||t===160||t>=5760&&$.indexOf(t)>=0}function et(t){switch(t|32){case 109:case 122:case 108:case 104:case 118:case 99:case 115:case 113:case 116:case 97:case 114:return!0}return!1}function rt(t){return(t|32)===97}function S(t){return t>=48&&t<=57}function at(t){return t>=48&&t<=57||t===43||t===45||t===46}function it(t){this.index=0,this.path=t,this.max=t.length,this.result=[],this.param=0,this.err="",this.segmentStart=0,this.data=[]}function Y(t){for(;t.index<t.max&&tt(t.path.charCodeAt(t.index));)t.index++}function nt(t){var i=t.path.charCodeAt(t.index);if(i===48){t.param=0,t.index++;return}if(i===49){t.param=1,t.index++;return}t.err="SvgPath: arc flag can be 0 or 1 only (at pos "+t.index+")"}function ht(t){var i=t.index,r=i,e=t.max,n=!1,h=!1,a=!1,u=!1,s;if(r>=e){t.err="SvgPath: missed param (at pos "+r+")";return}if(s=t.path.charCodeAt(r),(s===43||s===45)&&(r++,s=r<e?t.path.charCodeAt(r):0),!S(s)&&s!==46){t.err="SvgPath: param should start with 0..9 or `.` (at pos "+r+")";return}if(s!==46){if(n=s===48,r++,s=r<e?t.path.charCodeAt(r):0,n&&r<e&&s&&S(s)){t.err="SvgPath: numbers started with `0` such as `09` are illegal (at pos "+i+")";return}for(;r<e&&S(t.path.charCodeAt(r));)r++,h=!0;s=r<e?t.path.charCodeAt(r):0}if(s===46){for(u=!0,r++;S(t.path.charCodeAt(r));)r++,a=!0;s=r<e?t.path.charCodeAt(r):0}if(s===101||s===69){if(u&&!h&&!a){t.err="SvgPath: invalid float exponent (at pos "+r+")";return}if(r++,s=r<e?t.path.charCodeAt(r):0,(s===43||s===45)&&r++,r<e&&S(t.path.charCodeAt(r)))for(;r<e&&S(t.path.charCodeAt(r));)r++;else{t.err="SvgPath: invalid float exponent (at pos "+r+")";return}}t.index=r,t.param=parseFloat(t.path.slice(i,r))+0}function R(t){var i,r;i=t.path[t.segmentStart],r=i.toLowerCase();var e=t.data;if(r==="m"&&e.length>2&&(t.result.push([i,e[0],e[1]]),e=e.slice(2),r="l",i=i==="m"?"l":"L"),r==="r")t.result.push([i].concat(e));else for(;e.length>=X[r]&&(t.result.push([i].concat(e.splice(0,X[r]))),!!X[r]););}function ut(t){var i=t.max,r,e,n,h,a;if(t.segmentStart=t.index,r=t.path.charCodeAt(t.index),e=rt(r),!et(r)){t.err="SvgPath: bad command "+t.path[t.index]+" (at pos "+t.index+")";return}if(h=X[t.path[t.index].toLowerCase()],t.index++,Y(t),t.data=[],!h){R(t);return}for(n=!1;;){for(a=h;a>0;a--){if(e&&(a===3||a===4)?nt(t):ht(t),t.err.length){R(t);return}t.data.push(t.param),Y(t),n=!1,t.index<i&&t.path.charCodeAt(t.index)===44&&(t.index++,Y(t),n=!0)}if(!n&&(t.index>=t.max||!at(t.path.charCodeAt(t.index))))break}R(t)}U.exports=function(i){var r=new it(i),e=r.max;for(Y(r);r.index<e&&!r.err.length;)ut(r);return r.result.length&&("mM".indexOf(r.result[0][0])<0?(r.err="SvgPath: string should start with `M` or `m`",r.result=[]):r.result[0][0]="M"),{err:r.err,segments:r.result}}});var z=A((kt,B)=>{"use strict";function st(t,i){return[t[0]*i[0]+t[2]*i[1],t[1]*i[0]+t[3]*i[1],t[0]*i[2]+t[2]*i[3],t[1]*i[2]+t[3]*i[3],t[0]*i[4]+t[2]*i[5]+t[4],t[1]*i[4]+t[3]*i[5]+t[5]]}function x(){if(!(this instanceof x))return new x;this.queue=[],this.cache=null}x.prototype.matrix=function(t){return t[0]===1&&t[1]===0&&t[2]===0&&t[3]===1&&t[4]===0&&t[5]===0?this:(this.cache=null,this.queue.push(t),this)};x.prototype.translate=function(t,i){return(t!==0||i!==0)&&(this.cache=null,this.queue.push([1,0,0,1,t,i])),this};x.prototype.scale=function(t,i){return(t!==1||i!==1)&&(this.cache=null,this.queue.push([t,0,0,i,0,0])),this};x.prototype.rotate=function(t,i,r){var e,n,h;return t!==0&&(this.translate(i,r),e=t*Math.PI/180,n=Math.cos(e),h=Math.sin(e),this.queue.push([n,h,-h,n,0,0]),this.cache=null,this.translate(-i,-r)),this};x.prototype.skewX=function(t){return t!==0&&(this.cache=null,this.queue.push([1,0,Math.tan(t*Math.PI/180),1,0,0])),this};x.prototype.skewY=function(t){return t!==0&&(this.cache=null,this.queue.push([1,Math.tan(t*Math.PI/180),0,1,0,0])),this};x.prototype.toArray=function(){if(this.cache)return this.cache;if(!this.queue.length)return this.cache=[1,0,0,1,0,0],this.cache;if(this.cache=this.queue[0],this.queue.length===1)return this.cache;for(var t=1;t<this.queue.length;t++)this.cache=st(this.cache,this.queue[t]);return this.cache};x.prototype.calc=function(t,i,r){var e;return this.queue.length?(this.cache||(this.cache=this.toArray()),e=this.cache,[t*e[0]+i*e[2]+(r?0:e[4]),t*e[1]+i*e[3]+(r?0:e[5])]):[t,i]};B.exports=x});var T=A((Ct,H)=>{"use strict";var ot=z(),ct={matrix:!0,scale:!0,rotate:!0,translate:!0,skewX:!0,skewY:!0},ft=/\s*(matrix|translate|scale|rotate|skewX|skewY)\s*\(\s*(.+?)\s*\)[\s,]*/,lt=/[\s,]+/;H.exports=function(i){var r=new ot,e,n;return i.split(ft).forEach(function(h){if(h.length){if(typeof ct[h]<"u"){e=h;return}switch(n=h.split(lt).map(function(a){return+a||0}),e){case"matrix":n.length===6&&r.matrix(n);return;case"scale":n.length===1?r.scale(n[0],n[0]):n.length===2&&r.scale(n[0],n[1]);return;case"rotate":n.length===1?r.rotate(n[0],0,0):n.length===3&&r.rotate(n[0],n[1],n[2]);return;case"translate":n.length===1?r.translate(n[0],0):n.length===2&&r.translate(n[0],n[1]);return;case"skewX":n.length===1&&r.skewX(n[0]);return;case"skewY":n.length===1&&r.skewY(n[0]);return}}}),r}});var O=A((qt,K)=>{"use strict";var b=Math.PI*2;function J(t,i,r,e){var n=t*e-i*r<0?-1:1,h=t*r+i*e;return h>1&&(h=1),h<-1&&(h=-1),n*Math.acos(h)}function pt(t,i,r,e,n,h,a,u,s,o){var f=o*(t-r)/2+s*(i-e)/2,l=-s*(t-r)/2+o*(i-e)/2,c=a*a,g=u*u,_=f*f,v=l*l,d=c*g-c*v-g*_;d<0&&(d=0),d/=c*v+g*_,d=Math.sqrt(d)*(n===h?-1:1);var C=d*a/u*l,m=d*-u/a*f,D=o*C-s*m+(t+r)/2,y=s*C+o*m+(i+e)/2,M=(f-C)/a,w=(l-m)/u,F=(-f-C)/a,P=(-l-m)/u,I=J(1,0,M,w),q=J(M,w,F,P);return h===0&&q>0&&(q-=b),h===1&&q<0&&(q+=b),[D,y,I,q]}function vt(t,i){var r=1.3333333333333333*Math.tan(i/4),e=Math.cos(t),n=Math.sin(t),h=Math.cos(t+i),a=Math.sin(t+i);return[e,n,e-n*r,n+e*r,h+a*r,a-h*r,h,a]}K.exports=function(i,r,e,n,h,a,u,s,o){var f=Math.sin(o*b/360),l=Math.cos(o*b/360),c=l*(i-e)/2+f*(r-n)/2,g=-f*(i-e)/2+l*(r-n)/2;if(c===0&&g===0)return[];if(u===0||s===0)return[];u=Math.abs(u),s=Math.abs(s);var _=c*c/(u*u)+g*g/(s*s);_>1&&(u*=Math.sqrt(_),s*=Math.sqrt(_));var v=pt(i,r,e,n,h,a,u,s,f,l),d=[],C=v[2],m=v[3],D=Math.max(Math.ceil(Math.abs(m)/(b/4)),1);m/=D;for(var y=0;y<D;y++)d.push(vt(C,m)),C+=m;return d.map(function(M){for(var w=0;w<M.length;w+=2){var F=M[w+0],P=M[w+1];F*=u,P*=s;var I=l*F-f*P,q=f*F+l*P;M[w+0]=I+v[0],M[w+1]=q+v[1]}return M})}});var j=A((At,Z)=>{"use strict";var L=1e-10,Q=Math.PI/180;function E(t,i,r){if(!(this instanceof E))return new E(t,i,r);this.rx=t,this.ry=i,this.ax=r}E.prototype.transform=function(t){var i=Math.cos(this.ax*Q),r=Math.sin(this.ax*Q),e=[this.rx*(t[0]*i+t[2]*r),this.rx*(t[1]*i+t[3]*r),this.ry*(-t[0]*r+t[2]*i),this.ry*(-t[1]*r+t[3]*i)],n=e[0]*e[0]+e[2]*e[2],h=e[1]*e[1]+e[3]*e[3],a=((e[0]-e[3])*(e[0]-e[3])+(e[2]+e[1])*(e[2]+e[1]))*((e[0]+e[3])*(e[0]+e[3])+(e[2]-e[1])*(e[2]-e[1])),u=(n+h)/2;if(a<L*u)return this.rx=this.ry=Math.sqrt(u),this.ax=0,this;var s=e[0]*e[1]+e[2]*e[3];a=Math.sqrt(a);var o=u+a/2,f=u-a/2;return this.ax=Math.abs(s)<L&&Math.abs(o-h)<L?90:Math.atan(Math.abs(s)>Math.abs(o-h)?(o-n)/s:s/(o-h))*180/Math.PI,this.ax>=0?(this.rx=Math.sqrt(o),this.ry=Math.sqrt(f)):(this.ax+=90,this.rx=Math.sqrt(f),this.ry=Math.sqrt(o)),this};E.prototype.isDegenerate=function(){return this.rx<L*this.ry||this.ry<L*this.rx};Z.exports=E});var N=A((St,G)=>{"use strict";var xt=V(),gt=T(),k=z(),dt=O(),_t=j();function p(t){if(!(this instanceof p))return new p(t);var i=xt(t);this.segments=i.segments,this.err=i.err,this.__stack=[]}p.from=function(t){if(typeof t=="string")return new p(t);if(t instanceof p){var i=new p("");return i.err=t.err,i.segments=t.segments.map(function(r){return r.slice()}),i.__stack=t.__stack.map(function(r){return k().matrix(r.toArray())}),i}throw new Error("SvgPath.from: invalid param type "+t)};p.prototype.__matrix=function(t){var i=this,r;t.queue.length&&this.iterate(function(e,n,h,a){var u,s,o,f;switch(e[0]){case"v":u=t.calc(0,e[1],!0),s=u[0]===0?["v",u[1]]:["l",u[0],u[1]];break;case"V":u=t.calc(h,e[1],!1),s=u[0]===t.calc(h,a,!1)[0]?["V",u[1]]:["L",u[0],u[1]];break;case"h":u=t.calc(e[1],0,!0),s=u[1]===0?["h",u[0]]:["l",u[0],u[1]];break;case"H":u=t.calc(e[1],a,!1),s=u[1]===t.calc(h,a,!1)[1]?["H",u[0]]:["L",u[0],u[1]];break;case"a":case"A":var l=t.toArray(),c=_t(e[1],e[2],e[3]).transform(l);if(l[0]*l[3]-l[1]*l[2]<0&&(e[5]=e[5]?"0":"1"),u=t.calc(e[6],e[7],e[0]==="a"),e[0]==="A"&&e[6]===h&&e[7]===a||e[0]==="a"&&e[6]===0&&e[7]===0){s=[e[0]==="a"?"l":"L",u[0],u[1]];break}c.isDegenerate()?s=[e[0]==="a"?"l":"L",u[0],u[1]]:s=[e[0],c.rx,c.ry,c.ax,e[4],e[5],u[0],u[1]];break;case"m":f=n>0,u=t.calc(e[1],e[2],f),s=["m",u[0],u[1]];break;default:for(o=e[0],s=[o],f=o.toLowerCase()===o,r=1;r<e.length;r+=2)u=t.calc(e[r],e[r+1],f),s.push(u[0],u[1])}i.segments[n]=s},!0)};p.prototype.__evaluateStack=function(){var t,i;if(this.__stack.length){if(this.__stack.length===1){this.__matrix(this.__stack[0]),this.__stack=[];return}for(t=k(),i=this.__stack.length;--i>=0;)t.matrix(this.__stack[i].toArray());this.__matrix(t),this.__stack=[]}};p.prototype.toString=function(){var t="",i="",r=!1;this.__evaluateStack();for(var e=0,n=this.segments.length;e<n;e++){var h=this.segments[e],a=h[0];a!==i||a==="m"||a==="M"?(a==="m"&&i==="z"&&(t+=" "),t+=a,r=!1):r=!0;for(var u=1;u<h.length;u++){var s=h[u];u===1?r&&s>=0&&(t+=" "):s>=0&&(t+=" "),t+=s}i=a}return t};p.prototype.translate=function(t,i){return this.__stack.push(k().translate(t,i||0)),this};p.prototype.scale=function(t,i){return this.__stack.push(k().scale(t,!i&&i!==0?t:i)),this};p.prototype.rotate=function(t,i,r){return this.__stack.push(k().rotate(t,i||0,r||0)),this};p.prototype.skewX=function(t){return this.__stack.push(k().skewX(t)),this};p.prototype.skewY=function(t){return this.__stack.push(k().skewY(t)),this};p.prototype.matrix=function(t){return this.__stack.push(k().matrix(t)),this};p.prototype.transform=function(t){return t.trim()?(this.__stack.push(gt(t)),this):this};p.prototype.round=function(t){var i=0,r=0,e=0,n=0,h;return t=t||0,this.__evaluateStack(),this.segments.forEach(function(a){var u=a[0].toLowerCase()===a[0];switch(a[0]){case"H":case"h":u&&(a[1]+=e),e=a[1]-a[1].toFixed(t),a[1]=+a[1].toFixed(t);return;case"V":case"v":u&&(a[1]+=n),n=a[1]-a[1].toFixed(t),a[1]=+a[1].toFixed(t);return;case"Z":case"z":e=i,n=r;return;case"M":case"m":u&&(a[1]+=e,a[2]+=n),e=a[1]-a[1].toFixed(t),n=a[2]-a[2].toFixed(t),i=e,r=n,a[1]=+a[1].toFixed(t),a[2]=+a[2].toFixed(t);return;case"A":case"a":u&&(a[6]+=e,a[7]+=n),e=a[6]-a[6].toFixed(t),n=a[7]-a[7].toFixed(t),a[1]=+a[1].toFixed(t),a[2]=+a[2].toFixed(t),a[3]=+a[3].toFixed(t+2),a[6]=+a[6].toFixed(t),a[7]=+a[7].toFixed(t);return;default:h=a.length,u&&(a[h-2]+=e,a[h-1]+=n),e=a[h-2]-a[h-2].toFixed(t),n=a[h-1]-a[h-1].toFixed(t),a.forEach(function(s,o){o&&(a[o]=+a[o].toFixed(t))});return}}),this};p.prototype.iterate=function(t,i){var r=this.segments,e={},n=!1,h=0,a=0,u=0,s=0,o,f,l;if(i||this.__evaluateStack(),r.forEach(function(c,g){var _=t(c,g,h,a);Array.isArray(_)&&(e[g]=_,n=!0);var v=c[0]===c[0].toLowerCase();switch(c[0]){case"m":case"M":h=c[1]+(v?h:0),a=c[2]+(v?a:0),u=h,s=a;return;case"h":case"H":h=c[1]+(v?h:0);return;case"v":case"V":a=c[1]+(v?a:0);return;case"z":case"Z":h=u,a=s;return;default:h=c[c.length-2]+(v?h:0),a=c[c.length-1]+(v?a:0)}}),!n)return this;for(l=[],o=0;o<r.length;o++)if(typeof e[o]<"u")for(f=0;f<e[o].length;f++)l.push(e[o][f]);else l.push(r[o]);return this.segments=l,this};p.prototype.abs=function(){return this.iterate(function(t,i,r,e){var n=t[0],h=n.toUpperCase(),a;if(n!==h)switch(t[0]=h,n){case"v":t[1]+=e;return;case"a":t[6]+=r,t[7]+=e;return;default:for(a=1;a<t.length;a++)t[a]+=a%2?r:e}},!0),this};p.prototype.rel=function(){return this.iterate(function(t,i,r,e){var n=t[0],h=n.toLowerCase(),a;if(n!==h&&!(i===0&&n==="M"))switch(t[0]=h,n){case"V":t[1]-=e;return;case"A":t[6]-=r,t[7]-=e;return;default:for(a=1;a<t.length;a++)t[a]-=a%2?r:e}},!0),this};p.prototype.unarc=function(){return this.iterate(function(t,i,r,e){var n,h,a,u=[],s=t[0];return s!=="A"&&s!=="a"?null:(s==="a"?(h=r+t[6],a=e+t[7]):(h=t[6],a=t[7]),n=dt(r,e,h,a,t[4],t[5],t[1],t[2],t[3]),n.length===0?[[t[0]==="a"?"l":"L",t[6],t[7]]]:(n.forEach(function(o){u.push(["C",o[2],o[3],o[4],o[5],o[6],o[7]])}),u))}),this};p.prototype.unshort=function(){var t=this.segments,i,r,e,n,h;return this.iterate(function(a,u,s,o){var f=a[0],l=f.toUpperCase(),c;u&&(l==="T"?(c=f==="t",e=t[u-1],e[0]==="Q"?(i=e[1]-s,r=e[2]-o):e[0]==="q"?(i=e[1]-e[3],r=e[2]-e[4]):(i=0,r=0),n=-i,h=-r,c||(n+=s,h+=o),t[u]=[c?"q":"Q",n,h,a[1],a[2]]):l==="S"&&(c=f==="s",e=t[u-1],e[0]==="C"?(i=e[3]-s,r=e[4]-o):e[0]==="c"?(i=e[3]-e[5],r=e[4]-e[6]):(i=0,r=0),n=-i,h=-r,c||(n+=s,h+=o),t[u]=[c?"c":"C",n,h,a[1],a[2],a[3],a[4]]))}),this};G.exports=p});var mt=A((Ft,W)=>{W.exports=N()});return mt();})();

/* Bandenstudio: portable millimetre documents. No account, network or business writes. */
(function(root){
  'use strict';
  const CI={marine:'#1d2760',orange:'#e8741f',weiss:'#ffffff',tinte:'#1c1c22',papier:'#f6f6f2'};
  const FONTS={condensed:{name:'Barlow Condensed',file:'bandenstudio-condensed.ttf'},barlow:{name:'Barlow',file:'bandenstudio-barlow.ttf'},anton:{name:'Anton',file:'bandenstudio-anton.ttf'}};
  const FORMATS=[['250x80',2500,800],['300x80',3000,800],['400x80',4000,800],['500x80',5000,800],['600x80',6000,800],['200x100',2000,1000]];
  const TEMPLATES=[['klar','Klar'],['marine','Marine'],['logo','Logo im Mittelpunkt'],['kante','Mit Farbkante']];
  const num=(v,min,max,fallback)=>Number.isFinite(+v)?Math.min(max,Math.max(min,+v)):fallback;
  const text=(v,max=180)=>String(v==null?'':v).replace(/[\u0000-\u0008\u000b-\u001f]/g,'').slice(0,max);
  const colour=(v,f=CI.marine)=>/^#[0-9a-f]{6}$/i.test(String(v))?String(v).toLowerCase():f;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const copyDocument=d=>({...d,profile:d.profile?{...d.profile}:null,assets:{...d.assets},elements:d.elements.map(e=>({...e}))});
  const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'bd-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const isRaster=s=>/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s||'');
  const hexRGB=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  // Recognise whole contact lines only. Brand names and ordinary copy are not contact data.
  function contactLine(value){
    const line=String(value==null?'':value).trim();if(!line)return false;
    const labelled=line.match(/^(telefon|tel\.?|telefax|fax|mobil|handy|phone|e[ -]?mail|mail|internet|website|homepage|web|url)\s*:?\s+(.+)$/i)||line.match(/^(telefon|tel\.?|telefax|fax|mobil|handy|phone|e[ -]?mail|mail|internet|website|homepage|web|url)\s*:\s*(.+)$/i);
    const valueOnly=(labelled?labelled[2]:line).trim();
    if(/^(?:https?:\/\/|www\.)[^\s<>]+$/i.test(valueOnly))return true;
    if(/^(?:mailto:)?[^\s@<>]+@(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,63}$/iu.test(valueOnly))return true;
    if(/^(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}]{2,63}(?::\d{1,5})?(?:[/?#][^\s<>]*)?$/iu.test(valueOnly))return true;
    const phone=valueOnly.replace(/^tel:/i,'').trim(),digits=phone.replace(/\D/g,''),phoneLabel=/^tel:/i.test(valueOnly)||!!(labelled&&/^(?:telefon|tel\.?|telefax|fax|mobil|handy|phone)$/i.test(labelled[1]));
    if(/^[+\d().\s/-]+$/.test(phone)&&digits.length>=(phoneLabel?3:7)&&digits.length<=18&&(phoneLabel||/^(?:\+|0)/.test(phone)))return true;
    const parts=line.split(/\s*[;|·•]\s*/);return parts.length>1&&parts.some(contactLine);
  }
  const contactTokens=/(?:https?:\/\/|www\.)[^\s<>]+|(?:mailto:)?[^\s@<>]+@(?:[\p{L}\p{N}-]+\.)+[\p{L}]{2,63}|\b(?:[\p{L}\p{N}-]+\.)+(?:de|com|net|org|eu|info|pro|io|app|online|shop|store|dev|co|at|ch|biz|club|digital|gmbh|example|invalid|test)(?::\d{1,5})?(?:[/?#][^\s<>]*)?\b/iu;
  const labelledPhone=/(?:^|\s)(?:telefon|tel\.?|telefax|fax|mobil|handy|phone)\s*:?\s*[+\d][\d(). /+-]{2,}/iu;
  const inlinePhone=/(^|\s)((?:\+|0)[\d(). /-]{5,}\d)(?=$|[\s,;|·•])/u;
  function domainToken(value){const token=String(value).replace(/^[\[("']+|[\])"',;!?]+$/g,'');if(/^(?:co\.kg|gmbh&co\.kg|dr\.[\p{L}.]+|prof\.[\p{L}.]+|dipl\.[\p{L}.]+|e\.v\.?|e\.k\.?)$/iu.test(token))return false;return /[.@]/.test(token)&&contactLine(token);}
  function hasInlinePhone(line){const m=String(line).match(inlinePhone);return !!m&&m[2].replace(/\D/g,'').length>=7;}
  function isContactText(value){return String(value==null?'':value).split(/\r?\n/).some(line=>contactLine(line)||contactTokens.test(line)||labelledPhone.test(line)||hasInlinePhone(line)||line.split(/\s+/).some(domainToken));}
  function withoutContactLine(line){
    if(!isContactText(line))return line;
    return line.split(/\s*[;|·•]\s*/).map(part=>{
      if(contactLine(part))return '';
      return part.split(/(\s+)/).map(token=>domainToken(token)?'':token).join('').replace(new RegExp(contactTokens.source,'giu'),'').replace(new RegExp(labelledPhone.source,'giu'),' ').replace(new RegExp(inlinePhone.source,'gu'),(all,gap,number)=>number.replace(/\D/g,'').length>=7?gap:all).replace(/(?:website|homepage|internet|e[ -]?mail|mail|web|url)\s*:\s*$/iu,'').replace(/\s{2,}/g,' ').trim();
    }).filter(Boolean).join(' · ').trim();
  }
  function cleanContacts(doc){
    const d=normalise(doc);d.elements=d.elements.flatMap(e=>{
      if(e.type!=='text')return [e];if(e.role==='web')return [];
      const value=e.text.split(/\r?\n/).map(withoutContactLine).filter(line=>line.trim()).join('\n');return value.trim()?[{...e,text:value}]:[];
    });return d;
  }
  function normalise(raw){
    if(!raw||raw.schema!=='svbsc.bande'||raw.version!==1)throw Error('Das ist kein Bandenstudio-Projekt dieser Fassung.');
    if(!Array.isArray(raw.elements)||raw.elements.length>60)throw Error('Ein Projekt kann höchstens 60 Elemente enthalten.');
    const d={schema:'svbsc.bande',version:1,id:text(raw.id,80)||uid(),title:text(raw.title,120),width:num(raw.width,100,20000,3000),height:num(raw.height,100,3000,800),bleed:num(raw.bleed,0,100,20),safe:num(raw.safe,0,200,40),background:colour(raw.background,CI.weiss),scale:raw.scale===10?10:1,minDpi:num(raw.minDpi,50,300,100),mode:raw.mode==='cmyk'?'cmyk':'rgb',rgbAccepted:raw.rgbAccepted===true,profile:null,assets:{},elements:[],updated:text(raw.updated,40)};
    if(d.safe>=Math.min(d.width,d.height)/2)throw Error('Der Sicherheitsabstand muss kleiner als die halbe kurze Seite sein.');
    const entries=Object.entries(raw.assets||{});if(entries.length>20)throw Error('Ein Projekt kann höchstens 20 Bilder enthalten.');
    let bytes=0;
    for(const [id,a] of entries){
      if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)||['__proto__','constructor','prototype'].includes(id)||!a||typeof a!=='object')throw Error('Eine Bildkennung ist ungültig.');
      if(!isRaster(a.src)||a.src.length>40*1024*1024)throw Error('Ein Bild hat ein unbekanntes oder zu großes Format.');
      bytes+=a.src.length+(typeof a.original==='string'?a.original.length:0);if(bytes>90*1024*1024)throw Error('Die Projektbilder sind zusammen zu groß.');
      const asset={name:text(a.name,120),src:a.src,width:num(a.width,1,30000,1),height:num(a.height,1,30000,1),kind:'raster',light:a.light===true};
      if(a.original){if(!isRaster(a.original))throw Error('Das Originalbild ist ungültig.');asset.original=a.original;}
      if(a.vector){
        const v=a.vector;if(!Array.isArray(v.paths)||!v.paths.length||v.paths.length>1500)throw Error('Das Vektorlogo hat zu viele oder keine Formen.');
        asset.vector={width:num(v.width,.001,100000,1),height:num(v.height,.001,100000,1),paths:v.paths.map(p=>{
          if(typeof p.d!=='string'||p.d.length>250000||!/^[MmLlHhVvCcSsQqTtAaZzEe0-9.,+\s-]+$/.test(p.d))throw Error('Ein Vektorpfad ist ungültig.');
          if((p.d.match(/[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?/gi)||[]).some(n=>!Number.isFinite(+n)||Math.abs(+n)>10000000))throw Error('Ein Vektorpfad liegt außerhalb des zulässigen Bereichs.');
          const fill=p.fill==='none'?'none':colour(p.fill,'#000000'),stroke=p.stroke==='none'?'none':colour(p.stroke,'#000000');
          return {d:p.d,fill,stroke,strokeWidth:num(p.strokeWidth,0,1000,0),opacity:num(p.opacity,0,1,1),rule:p.rule==='evenodd'?'evenodd':'nonzero'};
        })};asset.kind='vector';
      }
      d.assets[id]=asset;
    }
    if(raw.profile){if(typeof raw.profile.data!=='string'||!/^[A-Za-z0-9+/=]+$/.test(raw.profile.data)||raw.profile.data.length>12*1024*1024)throw Error('Das Druckprofil ist ungültig.');d.profile={name:text(raw.profile.name,120),data:raw.profile.data};}
    const ids=new Set();
    for(const e of raw.elements){
      if(!e||!['text','image','rect'].includes(e.type))throw Error('Ein Gestaltungselement ist unbekannt.');
      const id=text(e.id,90);if(!/^[a-zA-Z0-9_-]{1,90}$/.test(id)||ids.has(id))throw Error('Die Elementkennungen sind ungültig.');ids.add(id);
      const el={id,type:e.type,x:num(e.x,-100,20100,0),y:num(e.y,-100,3100,0),w:num(e.w,.5,20000,100),h:num(e.h,.5,3000,100),locked:e.locked===true};
      if(e.type==='text')Object.assign(el,{text:text(e.text),role:['name','claim','web'].includes(e.role)?e.role:'text',font:Object.prototype.hasOwnProperty.call(FONTS,e.font)?e.font:'condensed',size:num(e.size,2,2000,100),fill:colour(e.fill),align:['left','center','right'].includes(e.align)?e.align:'left'});
      if(e.type==='rect')el.fill=colour(e.fill);
      if(e.type==='image'){if(!Object.prototype.hasOwnProperty.call(d.assets,e.asset))throw Error('Ein verwendetes Logo fehlt im Projekt.');el.asset=e.asset;}
      d.elements.push(el);
    }
    return d;
  }
  function create(title=''){return normalise({schema:'svbsc.bande',version:1,id:uid(),title,width:3000,height:800,bleed:20,safe:40,background:CI.weiss,scale:1,minDpi:100,mode:'rgb',elements:[],assets:{}});}
  function template(doc,key,fields={}){
    const d=copyDocument(doc),W=d.width,H=d.height,m=Math.max(d.safe,Math.min(W,H)*.08),stripe=key==='kante'?Math.min(H*.09,W*.08):0,frame={x:m,y:m,w:W-2*m-stripe,h:H-2*m};
    const clean=value=>text(value,120).split(/\r?\n/).filter(line=>!contactLine(line)).join('\n').trim(),name=clean(fields.name||fields.title||d.title),claim=clean(fields.claim),logo=fields.asset||doc.elements.find(e=>e.type==='image')?.asset||Object.keys(d.assets)[Object.keys(d.assets).length-1];
    if(logo&&!Object.prototype.hasOwnProperty.call(d.assets,logo))throw Error('Das gewählte Logo fehlt im Projekt.');
    const light=!!d.assets[logo]?.light,dark=key==='marine'||light,pattern=['bb','moerlens'].includes(fields.pattern)?fields.pattern:'normal';
    d.background=dark?CI.marine:CI.weiss;d.elements=[];
    const rect=(x,y,w,h,fill)=>d.elements.push({id:uid(),type:'rect',x,y,w,h,fill,locked:false});
    const txt=(value,x,y,w,h,size,font,fill,align='left',role='text')=>{if(value)d.elements.push({id:uid(),type:'text',x,y,w,h,text:value,role,size,font,fill,align,locked:false});};
    const img=(x,y,w,h)=>{if(logo){const e={id:uid(),type:'image',asset:logo,x,y,w,h,locked:false};if(key==='marine'&&!light){const b=fitImage(e,d.assets[logo]),pad=Math.min(H*.025,m);rect(b.x-pad,b.y-pad,b.w+2*pad,b.h+2*pad,CI.weiss);}d.elements.push(e);}};
    const ink=dark?CI.weiss:CI.marine;
    const nameText=(x,w)=>txt(name,x,frame.y+frame.h*.09,w,frame.h*.82,frame.h*.82/.7,'condensed',ink,'center','name');
    if(!logo){
      nameText(frame.x,frame.w);
    }else if(pattern==='bb'){
      const lw=Math.min(frame.w*.32,frame.h*1.45),gap=Math.min(H*.10,frame.w*.04),sw=(frame.w-lw-2*gap)/2,size=Math.min(frame.h*.85,sw/3.16),th=size*.7;
      img(frame.x+(frame.w-lw)/2,frame.y,lw,frame.h);
      txt(fields.left==='EVENT'?fields.left:'EVENT',frame.x,(H-th)/2,sw,th,size,'condensed',ink,'center');
      txt(fields.right==='KREATIV'?fields.right:'KREATIV',frame.x+frame.w-sw,(H-th)/2,sw,th,size,'condensed',ink,'center');
    }else if(pattern==='moerlens'&&claim){
      const a=d.assets[logo],ch=Math.min(H*.14,frame.h*.22),gap=Math.min(H*.05,frame.h*.08),lh=Math.min(frame.h-ch-gap,frame.w*a.height/a.width),lw=lh*a.width/a.height,ly=frame.y+(frame.h-lh-gap-ch)/2;
      img(frame.x+(frame.w-lw)/2,ly,lw,lh);
      txt(claim,frame.x,ly+lh+gap,frame.w,ch,ch/.74,'barlow',ink,'center','claim');
    }else if(pattern==='normal'&&fields.nameAn===true&&name){
      const gap=Math.min(H*.10,frame.w*.06),lw=Math.min(frame.w*.35,frame.h*1.45);
      img(frame.x,frame.y,lw,frame.h);nameText(frame.x+lw+gap,frame.w-lw-gap);
    }else{
      img(frame.x,frame.y,frame.w,frame.h);
    }
    if(stripe)rect(W-stripe,0,stripe,H,CI.orange);
    return normalise(d);
  }
  function fitImage(e,a){const s=Math.min(e.w/a.width,e.h/a.height),w=a.width*s,h=a.height*s;return {x:e.x+(e.w-w)/2,y:e.y+(e.h-h)/2,w,h};}
  function textPath(e,font){
    if(!font)throw Error('Die CI-Schrift ist noch nicht geladen.');
    const lines=e.text.split(/\r?\n/).slice(0,4),fs=e.size,paths=lines.map((line,i)=>font.getPath(line,0,i*fs*1.15,fs,{kerning:true})),bounds=paths.map(p=>p.getBoundingBox());
    const x1=Math.min(...bounds.map(b=>b.x1)),x2=Math.max(...bounds.map(b=>b.x2)),y1=Math.min(...bounds.map(b=>b.y1)),y2=Math.max(...bounds.map(b=>b.y2)),s=Math.min(1,e.w/Math.max(.001,x2-x1),e.h/Math.max(.001,y2-y1));
    let x=e.x-x1*s;if(e.align==='center')x+=(e.w-(x2-x1)*s)/2;else if(e.align==='right')x+=e.w-(x2-x1)*s;
    const y=e.y-y1*s;
    const path=font.getPath('',0,0,fs);path.commands=[];
    let px=0,py=0,mx=0,my=0;
    for(const p of paths)for(const c of p.commands){let n={...c};for(const k of ['x','x1','x2'])if(k in n)n[k]=n[k]*s+x;for(const k of ['y','y1','y2'])if(k in n)n[k]=n[k]*s+y;
      // PDF has cubic curves only. Convert TrueType quadratics exactly, never via PDF's v shorthand.
      if(n.type==='Q')n={type:'C',x1:px+2/3*(n.x1-px),y1:py+2/3*(n.y1-py),x2:n.x+2/3*(n.x1-n.x),y2:n.y+2/3*(n.y1-n.y),x:n.x,y:n.y};
      path.commands.push(n);if(n.type==='M'){mx=n.x;my=n.y;}if('x'in n){px=n.x;py=n.y;}if(n.type==='Z'){px=mx;py=my;}
    }
    return {d:path.toPathData(4),size:fs*s,bounds:{x,y:e.y,w:(x2-x1)*s,h:(y2-y1)*s}};
  }
  function preflight(doc,fonts={},trusted=false){
    const d=trusted?doc:normalise(doc),issues=[];const add=(level,message,id)=>issues.push({level,message,id:id||null});
    if(!d.elements.some(e=>e.type==='image'||e.type==='text'&&e.text.trim()&&e.text!=='FIRMENNAME'))add('stop','Trag den Firmennamen ein oder setze ein Logo auf die Bande.');
    if(d.mode==='cmyk'&&!d.profile)add('stop','Für CMYK fehlt das ICC-Profil der Druckerei.');
    if(d.mode==='rgb'&&!d.rgbAccepted)add('stop','Bestätige, dass die Druckerei RGB-Daten annimmt, oder wähle CMYK mit ihrem ICC-Profil.');
    for(const e of d.elements){
      if(e.type!=='rect'&&(e.x<d.safe-.1||e.y<d.safe-.1||e.x+e.w>d.width-d.safe+.1||e.y+e.h>d.height-d.safe+.1))add('stop','Ein Logo oder Text liegt außerhalb des Sicherheitsabstands.',e.id);
      if(e.type==='image'){
        const a=d.assets[e.asset],b=fitImage(e,a),dpi=Math.min(a.width/(b.w/25.4),a.height/(b.h/25.4));
        if(!a.vector&&dpi<d.minDpi)add('stop','Das Logo erreicht nur '+Math.floor(dpi)+' dpi. Benötigt werden '+d.minDpi+' dpi. Setze es kleiner oder lade eine größere Datei bzw. ein Vektorlogo.',e.id);
        let ground=d.background;for(const lower of d.elements.slice(0,d.elements.indexOf(e)))if(lower.type==='rect'&&lower.x<=b.x&&lower.y<=b.y&&lower.x+lower.w>=b.x+b.w&&lower.y+lower.h>=b.y+b.h)ground=lower.fill;
        if(a.light&&hexRGB(ground).every(v=>v>=220))add('hint','Ein helles Logo liegt auf hellem Grund. Prüfe die Sichtbarkeit oder wähle eine der dunklen CI-Vorlagen.',e.id);
      }
      if(e.type==='text'){
        if(e.role==='web'||isContactText(e.text))add('stop','Entferne Website, E-Mail, Telefon oder Fax von der Bande.',e.id);
        const f=fonts[e.font];if(!f)add('stop','Die Schrift '+FONTS[e.font].name+' ist nicht geladen.',e.id);
        else if([...e.text.replace(/\s/g,'')].some(c=>f.charToGlyph(c).index===0))add('stop','Ein Zeichen fehlt in der gewählten Schrift. Bitte ersetze es.',e.id);
        else if(e.text.trim()){const p=textPath(e,f);if(p.size<e.size*.75)add('hint','Ein langer Text wird deutlich verkleinert. Kürze ihn für die Fernwirkung.',e.id);}
      }
    }
    return {ok:!issues.some(x=>x.level==='stop'),issues};
  }
  function history(first,limit=40){let rows=[copyDocument(first)],at=0;const state=d=>JSON.stringify({...d,assets:Object.keys(d.assets),profile:d.profile?{name:d.profile.name}:null});return {push(d){const old=rows[at],sameAssets=Object.keys(d.assets).every(k=>d.assets[k].src===old.assets[k]?.src),sameProfile=d.profile?.data===old.profile?.data;if(state(d)===state(old)&&sameAssets&&sameProfile)return;rows=rows.slice(0,at+1);rows.push(copyDocument(d));if(rows.length>limit)rows.shift();at=rows.length-1;},undo(){if(at>0)at--;return copyDocument(rows[at]);},redo(){if(at<rows.length-1)at++;return copyDocument(rows[at]);},get canUndo(){return at>0;},get canRedo(){return at<rows.length-1;}};}
  // Border-connected background removal. Internal white brand details remain untouched.
  function cutout(input,w,h,tolerance=30,region){
    if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<1||h<1||w*h>24000000||input.length!==w*h*4)throw Error('Das Bild ist zu groß oder beschädigt.');
    const r=region||{x:0,y:0,w,h},left=Math.max(0,Math.floor(r.x)),top=Math.max(0,Math.floor(r.y)),right=Math.min(w,Math.ceil(r.x+r.w)),bottom=Math.min(h,Math.ceil(r.y+r.h)),W=right-left,H=bottom-top;
    if(W<2||H<2)throw Error('Markiere einen größeren Logo-Bereich.');
    const p=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)p.set(input.subarray(((top+y)*w+left)*4,((top+y)*w+right)*4),y*W*4);
    const border=[];for(let x=0;x<W;x++)border.push(x,(H-1)*W+x);for(let y=1;y<H-1;y++)border.push(y*W,y*W+W-1);
    const counts=new Map();let transparent=0;for(const k of border){const j=k*4;if(p[j+3]<20){transparent++;continue;}const key=(p[j]>>4)*256+(p[j+1]>>4)*16+(p[j+2]>>4);counts.set(key,(counts.get(key)||0)+1);}
    let key=0,count=0;counts.forEach((v,k)=>{if(v>count){key=k;count=v;}});
    const already=transparent/border.length>.6,uniform=count/Math.max(1,border.length-transparent)>.55;
    let removed=0,bg=null;
    if(!already&&uniform&&tolerance>0){
      let rr=0,gg=0,bb=0,n=0;for(const k of border){const j=k*4,q=(p[j]>>4)*256+(p[j+1]>>4)*16+(p[j+2]>>4);if(q===key&&p[j+3]>20){rr+=p[j];gg+=p[j+1];bb+=p[j+2];n++;}}
      bg=[rr/n,gg/n,bb/n];const near=k=>{const j=k*4;return p[j+3]<20||Math.hypot(p[j]-bg[0],p[j+1]-bg[1],p[j+2]-bg[2])<=tolerance;};
      const seen=new Uint8Array(W*H),queue=new Int32Array(W*H);let start=0,end=0;
      for(const k of border)if(!seen[k]&&near(k)){seen[k]=1;queue[end++]=k;}
      while(start<end){const k=queue[start++],x=k%W,y=Math.floor(k/W);for(const next of [x>0?k-1:-1,x<W-1?k+1:-1,y>0?k-W:-1,y<H-1?k+W:-1])if(next>=0&&!seen[next]&&near(next)){seen[next]=1;queue[end++]=next;}}
      for(let k=0;k<W*H;k++)if(seen[k]){p[k*4+3]=0;removed++;}
    }
    let x0=W,y0=H,x1=-1,y1=-1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(p[(y*W+x)*4+3]>24){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    if(x1<0)throw Error('Dabei bleibt kein Logo übrig. Verringere die Stärke oder nutze das Original.');
    const pad=Math.max(1,Math.round(Math.max(x1-x0,y1-y0)*.01));x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(W-1,x1+pad);y1=Math.min(H-1,y1+pad);
    const cw=x1-x0+1,ch=y1-y0+1,out=new Uint8ClampedArray(cw*ch*4);for(let y=0;y<ch;y++)out.set(p.subarray(((y+y0)*W+x0)*4,((y+y0)*W+x0+cw)*4),y*cw*4);
    return {data:out,width:cw,height:ch,removed,background:bg,confidence:already?'transparent':uniform&&removed?'einfarbig':'prüfen',crop:{x:left+x0,y:top+y0,w:cw,h:ch}};
  }
  // Eine Querfassung kommt nur in Frage, wenn ein durchgehend transparenter
  // Abstand das kompakte obere Zeichen deutlich vom breiteren Schriftblock trennt.
  function logoBloecke({data,width,height}){
    if(width<32||height<32||width>3*height)return null;
    const streifen=[];
    let block;
    for(let y=0;y<height;y++){
      let links=width,rechts=-1;
      for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>0){
        links=Math.min(links,x);rechts=x;
      }
      if(rechts<0){block=null;continue;}
      if(!block){block={links,rechts,oben:y,unten:y};streifen.push(block);}
      block.links=Math.min(block.links,links);block.rechts=Math.max(block.rechts,rechts);block.unten=y;
    }
    if(streifen.length<2)return null;
    const oben=streifen[0],unten=streifen.slice(1);
    const luecke=unten[0].oben-oben.unten-1;
    if(luecke<Math.max(3,.055*height)||unten.some((s,i)=>i&&s.oben-unten[i-1].unten-1>=luecke*.85))return null;
    const box=s=>({x:Math.min(...s.map(b=>b.links)),y:s[0].oben,
      w:Math.max(...s.map(b=>b.rechts))-Math.min(...s.map(b=>b.links))+1,h:s[s.length-1].unten-s[0].oben+1});
    const zeichen=box([oben]),schrift=box(unten);
    if(zeichen.w/zeichen.h>2.25||zeichen.h<height*.24||schrift.w/schrift.h<2||schrift.w<width*.5)return null;
    return {zeichen,schrift};
  }
  const api={CI,FONTS,FORMATS,TEMPLATES,num,text,colour,clone,uid,esc,isRaster,hexRGB,isContactText,cleanContacts,normalise,create,template,fitImage,textPath,preflight,history,cutout,logoBloecke};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BD_CORE=api;
})(typeof window!=='undefined'?window:globalThis);

/* Shared preview/export geometry. Fonts become outlines, raster logos keep source pixels. */
(function(root){
  'use strict';
  const C=root.BD_CORE,fonts={},images=new Map();let ready;
  async function loadFonts(){
    if(ready)return ready;
    ready=Promise.all(Object.entries(C.FONTS).map(async([key,f])=>{
      const r=await fetch('fonts/'+f.file);if(!r.ok)throw Error('Die CI-Schrift lässt sich nicht laden. Bitte versuche es erneut.');
      fonts[key]=root.opentype.parse(await r.arrayBuffer());
    })).catch(()=>{ready=null;throw Error('Die CI-Schriften lassen sich gerade nicht laden. Prüfe deine Verbindung und lade die Seite erneut.');});return ready;
  }
  function image(src){if(images.has(src))return images.get(src);const p=new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(Error('Das Logo lässt sich nicht lesen.'));i.src=src;});images.set(src,p);p.catch(()=>images.delete(src));return p;}
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  async function validateAssets(d){
    for(const a of Object.values(d.assets)){
      const i=await image(a.src);if(!i.naturalWidth||!i.naturalHeight||i.naturalWidth*i.naturalHeight>24000000||i.naturalWidth>30000||i.naturalHeight>30000)throw Error('Ein Logo ist zu groß oder beschädigt. Bitte lade das Original neu.');
      if(a.vector){for(const p of a.vector.paths){const path=root.BD_SVGPATH(p.d);if(path.err||!path.segments.length)throw Error('Ein gespeicherter Vektorpfad ist ungültig.');}}
      else{a.width=i.naturalWidth;a.height=i.naturalHeight;}
      await analyseAsset(a);
    }
    return d;
  }
  function vectorSVG(v){return `<svg xmlns="http://www.w3.org/2000/svg" width="${v.width}" height="${v.height}" viewBox="0 0 ${v.width} ${v.height}">${v.paths.map(p=>`<path d="${C.esc(p.d)}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" opacity="${p.opacity}" fill-rule="${p.rule}"/>`).join('')}</svg>`;}
  async function vectorPreview(v){const u=URL.createObjectURL(new Blob([vectorSVG(v)],{type:'image/svg+xml'}));try{const i=await image(u),s=Math.min(1,1800/Math.max(v.width,v.height)),c=canvas(Math.max(1,Math.ceil(v.width*s)),Math.max(1,Math.ceil(v.height*s)));c.getContext('2d').drawImage(i,0,0,c.width,c.height);return c.toDataURL('image/png');}finally{images.delete(u);URL.revokeObjectURL(u);}}
  async function analyseAsset(asset){
    const bright=c=>c!=='none'&&C.hexRGB(c).every(v=>v>=235);let light=false;
    if(asset.vector){const paints=asset.vector.paths.filter(p=>p.opacity>0).flatMap(p=>[p.fill,p.stroke]).filter(c=>c!=='none');light=paints.length>0&&paints.every(bright);}
    else{
      const i=await image(asset.src),s=Math.min(1,256/Math.max(i.naturalWidth,i.naturalHeight)),c=canvas(Math.max(1,Math.ceil(i.naturalWidth*s)),Math.max(1,Math.ceil(i.naturalHeight*s))),ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(i,0,0,c.width,c.height);const rgba=ctx.getImageData(0,0,c.width,c.height).data;let visible=0,white=0;
      for(let j=0;j<rgba.length;j+=4)if(rgba[j+3]>32){visible++;if(rgba[j]>=235&&rgba[j+1]>=235&&rgba[j+2]>=235)white++;}
      light=visible>0&&white/visible>.92;c.width=c.height=1;
    }
    asset.light=light;return asset;
  }
  function vectorElement(v,b){return `<svg x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" viewBox="0 0 ${v.width} ${v.height}" overflow="hidden">${v.paths.map(p=>`<path d="${C.esc(p.d)}" fill="${p.fill}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" opacity="${p.opacity}" fill-rule="${p.rule}"/>`).join('')}</svg>`;}
  function drawVector(ctx,v,b){
    ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.w/v.width,b.h/v.height);ctx.beginPath();ctx.rect(0,0,v.width,v.height);ctx.clip();
    for(const p of v.paths){const path=new Path2D(p.d);ctx.globalAlpha=p.opacity;if(p.fill!=='none'){ctx.fillStyle=p.fill;ctx.fill(path,p.rule);}if(p.stroke!=='none'&&p.strokeWidth>0){ctx.strokeStyle=p.stroke;ctx.lineWidth=p.strokeWidth;ctx.stroke(path);}}
    ctx.restore();
  }
  const paintColor=value=>{
    value=String(value||'').trim().toLowerCase();if(value==='none')return 'none';
    const names={white:'#ffffff',black:'#000000',red:'#ff0000',blue:'#0000ff',green:'#008000',navy:'#000080',orange:'#ffa500',transparent:'none'};
    if(names[value])return names[value];if(/^#[0-9a-f]{6}$/.test(value))return value;if(/^#[0-9a-f]{3}$/.test(value))return '#'+value.slice(1).split('').map(x=>x+x).join('');
    const m=/^rgb\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*\)$/.exec(value);if(m&&m.slice(1).every(v=>+v<=255))return '#'+m.slice(1).map(v=>(+v).toString(16).padStart(2,'0')).join('');
    throw Error('Die SVG-Datei nutzt eine nicht unterstützte Farbe. Nutze eine SVG mit einfachen Flächen oder eine PNG-Datei.');
  };
  // Deliberately small, closed SVG grammar: no references, scripts, embedded files or CSS selectors.
  function readSVG(source){
    if(source.length>3*1024*1024||/<!DOCTYPE|<!ENTITY|<\?[^x]|(?:href|src)\s*=|url\s*\(|@import|<script|<foreignObject/i.test(source))throw Error('Diese SVG-Datei enthält Verweise oder aktive Inhalte. Nutze eine bereinigte Logo-Datei.');
    const xml=new DOMParser().parseFromString(source,'image/svg+xml'),svg=xml.documentElement;
    if(svg.localName!=='svg'||xml.querySelector('parsererror'))throw Error('Die SVG-Datei ist beschädigt.');
    const vb=(svg.getAttribute('viewBox')||'').trim().split(/[ ,]+/).map(Number),unit=s=>{const m=/^([0-9.]+)(px|mm|cm|in|pt)?$/.exec(s||'');return m?+m[1]*({mm:96/25.4,cm:96/2.54,in:96,pt:96/72,px:1}[m[2]]||1):0;};
    const [vx,vy,W,H]=vb.length===4&&vb.every(Number.isFinite)?vb:[0,0,unit(svg.getAttribute('width')),unit(svg.getAttribute('height'))];
    if(!(W>0&&H>0&&W<=100000&&H<=100000))throw Error('Der SVG-Datei fehlen gültige Maße.');
    const paths=[];let nodes=0;
    const number=(e,k,f=0)=>{const s=e.getAttribute(k);if(s==null)return f;if(!/^[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?$/i.test(s)||!Number.isFinite(+s)||Math.abs(+s)>1000000)throw Error('Die SVG-Geometrie ist ungültig.');return +s;};
    function walk(el,inherit,transform,parentAlpha=1){
      if(++nodes>2000)throw Error('Das SVG-Logo hat zu viele Elemente.');
      const tag=el.localName;if(['title','desc','metadata'].includes(tag))return;
      if(!['svg','g','path','rect','circle','ellipse','polygon','polyline','line'].includes(tag))throw Error('Das SVG nutzt '+tag+'. Nutze eine SVG aus Pfaden oder eine hochauflösende PNG-Datei.');
      for(const a of el.attributes)if(/^on/i.test(a.name)||/href|filter|mask|clip-path/i.test(a.name))throw Error('Die SVG enthält nicht unterstützte Verweise.');
      const style={...inherit};delete style.opacity;for(const [k,v]of(el.getAttribute('style')||'').split(';').filter(Boolean).map(s=>s.split(':').map(x=>x.trim()))){if(!['fill','stroke','stroke-width','opacity','fill-opacity','stroke-opacity','fill-rule'].includes(k))throw Error('Das SVG nutzt nicht unterstützte Stilregeln.');style[k]=v;}
      for(const k of ['fill','stroke','stroke-width','opacity','fill-opacity','stroke-opacity','fill-rule'])if(el.hasAttribute(k))style[k]=el.getAttribute(k);
      if(el.hasAttribute('class'))throw Error('Die SVG nutzt Stilklassen. Exportiere sie mit Inline-Stilen oder als PNG.');
      const tr=el.getAttribute('transform')||'';if(tr&&!/^[a-zA-Z0-9eE(),.\s+-]+$/.test(tr))throw Error('Die SVG-Transformation ist ungültig.');
      const full=(transform+' '+tr).trim();
      if(tag==='svg'||tag==='g'){for(const n of el.children)walk(n,style,full,parentAlpha*C.num(style.opacity,0,1,1));return;}
      let d='';
      if(tag==='path')d=el.getAttribute('d')||'';
      if(tag==='rect'){const x=number(el,'x'),y=number(el,'y'),w=number(el,'width'),h=number(el,'height');if(number(el,'rx')||number(el,'ry'))throw Error('Gerundete SVG-Flächen bitte vorher in Pfade umwandeln.');d=`M${x} ${y}h${w}v${h}h${-w}Z`;}
      if(tag==='circle'||tag==='ellipse'){const x=number(el,'cx'),y=number(el,'cy'),rx=number(el,tag==='circle'?'r':'rx'),ry=number(el,tag==='circle'?'r':'ry');d=`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;}
      if(tag==='polygon'||tag==='polyline'){const p=(el.getAttribute('points')||'').trim();if(!/^[0-9eE.,+\s-]+$/.test(p))throw Error('Die SVG-Punkte sind ungültig.');d='M'+p+(tag==='polygon'?'Z':'');}
      if(tag==='line')d=`M${number(el,'x1')} ${number(el,'y1')}L${number(el,'x2')} ${number(el,'y2')}`;
      if(!d)return;if(d.length>250000||!/^[MmLlHhVvCcSsQqTtAaZzEe0-9.,+\s-]+$/.test(d))throw Error('Ein SVG-Pfad ist ungültig.');
      const p=root.BD_SVGPATH(d).transform(full).abs();if(p.err)throw Error('Ein SVG-Pfad lässt sich nicht lesen.');
      const fill=paintColor(style.fill||'#000000'),stroke=paintColor(style.stroke||'none'),opacity=parentAlpha*C.num(style.opacity,0,1,1)*C.num(style['fill-opacity'],0,1,1);
      if(stroke!=='none'&&style['stroke-opacity']&&+style['stroke-opacity']!==C.num(style['fill-opacity'],0,1,1))throw Error('Die SVG nutzt verschiedene Deckungen. Bitte als PNG hochladen.');
      if(stroke!=='none'&&full.replace(`translate(${-vx} ${-vy})`,'').trim())throw Error('Transformierte SVG-Konturen bitte vorher in Flächen umwandeln.');
      paths.push({d:p.toString(),fill,stroke,strokeWidth:C.num(style['stroke-width'],0,1000,1),opacity,rule:style['fill-rule']==='evenodd'?'evenodd':'nonzero'});
    }
    walk(svg,{fill:'#000000',stroke:'none',opacity:'1'},`translate(${-vx} ${-vy})`);
    if(!paths.length)throw Error('Die SVG-Datei enthält keine sichtbaren Logo-Pfade.');return {width:W,height:H,paths};
  }
  async function render(ctx,d,scale=1){
    await loadFonts();await Promise.all(Object.values(d.assets).map(a=>image(a.src)));
    ctx.save();ctx.scale(scale,scale);ctx.fillStyle=d.background;ctx.fillRect(0,0,d.width,d.height);ctx.beginPath();ctx.rect(0,0,d.width,d.height);ctx.clip();
    for(const e of d.elements){
      if(e.type==='rect'){ctx.fillStyle=e.fill;ctx.fillRect(e.x,e.y,e.w,e.h);}
      else if(e.type==='text'&&e.text.trim()){ctx.fillStyle=e.fill;ctx.fill(new Path2D(C.textPath(e,fonts[e.font]).d));}
      else if(e.type==='image'){const a=d.assets[e.asset],b=C.fitImage(e,a);if(a.vector)drawVector(ctx,a.vector,b);else ctx.drawImage(await image(a.src),b.x,b.y,b.w,b.h);}
    }
    ctx.restore();
  }
  function svgDocument(doc){
    const d=C.normalise(doc),B=d.bleed,parts=[`<rect x="${-B}" y="${-B}" width="${d.width+2*B}" height="${d.height+2*B}" fill="${d.background}"/>`];
    for(const e of d.elements){
      if(e.type==='rect')parts.push(`<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${e.fill}"/>`);
      if(e.type==='text'&&e.text.trim())parts.push(`<path d="${C.textPath(e,fonts[e.font]).d}" fill="${e.fill}"/>`);
      if(e.type==='image'){const a=d.assets[e.asset],b=C.fitImage(e,a);if(a.vector)parts.push(vectorElement(a.vector,b));else parts.push(`<image x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" href="${a.src}"/>`);}
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${d.width+2*B}mm" height="${d.height+2*B}mm" viewBox="${-B} ${-B} ${d.width+2*B} ${d.height+2*B}"><title>${C.esc(d.title||'Bande')}</title>${parts.join('')}</svg>`;
  }
  const b64bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  let cmsPromise;
  async function colourEngine(profile){
    const bytes=b64bytes(profile.data);if(bytes.length<132||bytes.length>8*1024*1024||String.fromCharCode(...bytes.slice(36,40))!=='acsp'||String.fromCharCode(...bytes.slice(16,20))!=='CMYK'||String.fromCharCode(...bytes.slice(12,16))!=='prtr')throw Error('Bitte ein gültiges CMYK-Ausgabeprofil der Druckerei verwenden.');
    if(!cmsPromise)cmsPromise=import(new URL('./vendor/bandenstudio/lcms.mjs',location.href).href).then(async M=>({M,engine:await M.instantiate({locateFile:()=>new URL('./vendor/bandenstudio/lcms.wasm',location.href).href})})).catch(e=>{cmsPromise=null;throw Error('Das Farbwerkzeug lässt sich nicht laden. Bitte versuche es erneut.');});
    const {M,engine:l}=await cmsPromise,ip=l.cmsCreate_sRGBProfile(),op=l.cmsOpenProfileFromMem(bytes,bytes.length);
    if(!op){l.cmsCloseProfile(ip);throw Error('Das ICC-Profil lässt sich nicht lesen.');}
    const t=l.cmsCreateTransform(ip,M.TYPE_RGB_8,op,M.TYPE_CMYK_8,M.INTENT_RELATIVE_COLORIMETRIC,M.cmsFLAGS_BLACKPOINTCOMPENSATION);
    if(!t){l.cmsCloseProfile(ip);l.cmsCloseProfile(op);throw Error('Dieses Profil erlaubt keine Umrechnung von RGB nach CMYK.');}
    let closed=false;return {bytes,name:l.cmsGetProfileInfoASCII(op,M.cmsInfoDescription,'en','US')||profile.name,convert(rgb,count){if(closed)throw Error('Das Farbwerkzeug ist geschlossen.');return l.cmsDoTransform(t,rgb,count);},close(){if(!closed){l.cmsDeleteTransform(t);l.cmsCloseProfile(ip);l.cmsCloseProfile(op);closed=true;}}};
  }
  async function pdf(doc){
    await loadFonts();const d=await validateAssets(C.normalise(doc)),check=C.preflight(d,fonts,true);if(!check.ok)throw Error(check.issues.find(x=>x.level==='stop').message);
    const P=root.PDFLib,out=await P.PDFDocument.create(),B=d.bleed,M=10,realW=d.width+2*(B+M),realH=d.height+2*(B+M),uu=Math.max(1,Math.ceil(Math.max(realW,realH)/d.scale*72/25.4/14400)),k=72/25.4/d.scale/uu,W=realW*k,H=realH*k,O=(B+M)*k,page=out.addPage([W,H]);
    page.node.set(P.PDFName.of('UserUnit'),P.PDFNumber.of(uu));page.setTrimBox(O,O,d.width*k,d.height*k);page.setBleedBox(M*k,M*k,(d.width+2*B)*k,(d.height+2*B)*k);
    out.setTitle(d.title||'Bande');out.setCreator('SV/BSC Bandenstudio');out.setSubject(`Endformat ${d.width} x ${d.height} mm; Maßstab 1:${d.scale}; Beschnitt ${B} mm; ${d.mode.toUpperCase()}; Schrift als Pfade`);
    let cms=null;const colours=new Map(),gs=new Map();
    try{
      if(d.mode==='cmyk'){
        cms=await colourEngine(d.profile);const ref=out.context.register(out.context.flateStream(cms.bytes,{N:4,Alternate:'DeviceCMYK'}));
        out.catalog.set(P.PDFName.of('OutputIntents'),out.context.obj([out.context.obj({Type:'OutputIntent',S:'GTS_PDFX',OutputConditionIdentifier:P.PDFString.of(cms.name),Info:P.PDFString.of(cms.name),DestOutputProfile:ref})]));
      }
      const color=h=>{if(colours.has(h))return colours.get(h);const rgb=C.hexRGB(h),v=cms?P.cmyk(...Array.from(cms.convert(new Uint8Array(rgb),1),x=>x/255)):P.rgb(...rgb.map(x=>x/255));colours.set(h,v);return v;};
      function path(d,x,y,scale,fill,stroke='none',sw=0,opacity=1,rule='nonzero'){
        let graphicsState;if(opacity<1){if(!gs.has(opacity)){const ref=out.context.register(out.context.obj({Type:'ExtGState',ca:opacity,CA:opacity}));gs.set(opacity,page.node.newExtGState('BDAlpha',ref));}graphicsState=gs.get(opacity);}
        const cubic=root.BD_SVGPATH(d).abs().unshort().unarc().iterate((segment,index,px,py)=>segment[0]==='Q'?[['C',px+2/3*(segment[1]-px),py+2/3*(segment[2]-py),segment[3]+2/3*(segment[1]-segment[3]),segment[4]+2/3*(segment[2]-segment[4]),segment[3],segment[4]]]:undefined).toString();
        const ops=P.drawSvgPath(cubic,{x:O+x*k,y:H-O-y*k,scale:k*scale,color:fill==='none'?undefined:color(fill),borderColor:stroke==='none'?undefined:color(stroke),borderWidth:stroke==='none'?0:sw,graphicsState});
        page.pushOperators(...ops.map(op=>rule==='evenodd'&&op.toString()==='f'?P.PDFOperator.of('f*'):rule==='evenodd'&&op.toString()==='B'?P.PDFOperator.of('B*'):op));
      }
      page.drawRectangle({x:M*k,y:M*k,width:(d.width+2*B)*k,height:(d.height+2*B)*k,color:color(d.background)});
