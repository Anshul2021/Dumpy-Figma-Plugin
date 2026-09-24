// ==============================================================================
// DUMPY Mobile Web Uploader — Zero-Auth Controller with Device ID Tracking
// Pure Room-based cryptographic isolation with anonymous device fingerprinting
// ==============================================================================

(function(global) {
  'use strict';

  // Official Compliant QRCode Generator (Kazuhiko Arase, Offline Vector SVG, 4-Module Quiet Zone)
  var qrcode=(function(){var P=function(x,w){var g=236,l=17,n=x,s=O[w],t=null,r=0,h=null,i=[],v={},_=function(a,f){r=n*4+17,t=(function(e){for(var u=new Array(e),o=0;o<e;o+=1){u[o]=new Array(e);for(var d=0;d<e;d+=1)u[o][d]=null}return u})(r),B(0,0),B(r-7,0),B(0,r-7),E(),T(),m(a,f),n>=7&&N(a),h==null&&(h=nr(n,s,i)),U(h,f)},B=function(a,f){for(var e=-1;e<=7;e+=1)if(!(a+e<=-1||r<=a+e))for(var u=-1;u<=7;u+=1)f+u<=-1||r<=f+u||(0<=e&&e<=6&&(u==0||u==6)||0<=u&&u<=6&&(e==0||e==6)||2<=e&&e<=4&&2<=u&&u<=4?t[a+e][f+u]=!0:t[a+e][f+u]=!1)},y=function(){for(var a=0,f=0,e=0;e<8;e+=1){_(!0,e);var u=k.getLostPoint(v);(e==0||a>u)&&(a=u,f=e)}return f},T=function(){for(var a=8;a<r-8;a+=1)t[a][6]==null&&(t[a][6]=a%2==0);for(var f=8;f<r-8;f+=1)t[6][f]==null&&(t[6][f]=f%2==0)},E=function(){for(var a=k.getPatternPosition(n),f=0;f<a.length;f+=1)for(var e=0;e<a.length;e+=1){var u=a[f],o=a[e];if(t[u][o]==null)for(var d=-2;d<=2;d+=1)for(var c=-2;c<=2;c+=1)d==-2||d==2||c==-2||c==2||d==0&&c==0?t[u+d][o+c]=!0:t[u+d][o+c]=!1}},N=function(a){for(var f=k.getBCHTypeNumber(n),e=0;e<18;e+=1){var u=!a&&(f>>e&1)==1;t[Math.floor(e/3)][e%3+r-8-3]=u}for(var e=0;e<18;e+=1){var u=!a&&(f>>e&1)==1;t[e%3+r-8-3][Math.floor(e/3)]=u}},m=function(a,f){for(var e=s<<3|f,u=k.getBCHTypeInfo(e),o=0;o<15;o+=1){var d=!a&&(u>>o&1)==1;o<6?t[o][8]=d:o<8?t[o+1][8]=d:t[r-15+o][8]=d}for(var o=0;o<15;o+=1){var d=!a&&(u>>o&1)==1;o<8?t[8][r-o-1]=d:o<9?t[8][15-o-1+1]=d:t[8][15-o-1]=d}t[r-8][8]=!a},U=function(a,f){for(var e=-1,u=r-1,o=7,d=0,c=k.getMaskFunction(f),p=r-1;p>0;p-=2)for(p==6&&(p-=1);;){for(var b=0;b<2;b+=1)if(t[u][p-b]==null){var C=!1;d<a.length&&(C=(a[d]>>>o&1)==1);var A=c(u,p-b);A&&(C=!C),t[u][p-b]=C,o-=1,o==-1&&(d+=1,o=7)}if(u+=e,u<0||r<=u){u-=e,e=-e;break}}},H=function(a,f){for(var e=0,u=0,o=0,d=new Array(f.length),c=new Array(f.length),p=0;p<f.length;p+=1){var b=f[p].dataCount,C=f[p].totalCount-b;u=Math.max(u,b),o=Math.max(o,C),d[p]=new Array(b);for(var A=0;A<d[p].length;A+=1)d[p][A]=255&a.getBuffer()[A+e];e+=b;var R=k.getErrorCorrectPolynomial(C),I=K(d[p],R.getLength()-1),S=I.mod(R);c[p]=new Array(R.getLength()-1);for(var A=0;A<c[p].length;A+=1){var X=A+S.getLength()-c[p].length;c[p][A]=X>=0?S.getAt(X):0}}for(var Z=0,A=0;A<f.length;A+=1)Z+=f[A].totalCount;for(var J=new Array(Z),Q=0,A=0;A<u;A+=1)for(var p=0;p<f.length;p+=1)A<d[p].length&&(J[Q]=d[p][A],Q+=1);for(var A=0;A<o;A+=1)for(var p=0;p<f.length;p+=1)A<c[p].length&&(J[Q]=c[p][A],Q+=1);return J},nr=function(a,f,e){for(var u=Y.getRSBlocks(a,f),o=G(),d=0;d<e.length;d+=1){var c=e[d];o.put(c.getMode(),4),o.put(c.getLength(),k.getLengthInBits(c.getMode(),a)),c.write(o)}for(var p=0,d=0;d<u.length;d+=1)p+=u[d].dataCount;if(o.getLengthInBits()>p*8)throw"code length overflow. ("+o.getLengthInBits()+">"+p*8+")";for(o.getLengthInBits()+4<=p*8&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=p*8||(o.put(g,8),o.getLengthInBits()>=p*8));)o.put(l,8);return H(o,u)};v.addData=function(a,f){f=f||"Byte";var e=null;switch(f){case"Numeric":e=$(a);break;case"Alphanumeric":e=W(a);break;case"Byte":e=V(a);break;case"Kanji":e=q(a);break;default:throw"mode:"+f}i.push(e),h=null},v.isDark=function(a,f){if(a<0||r<=a||f<0||r<=f)throw a+","+f;return t[a][f]},v.getModuleCount=function(){return r},v.make=function(){if(n<1){for(var a=1;a<40;a++){for(var f=Y.getRSBlocks(a,s),e=G(),u=0;u<i.length;u++){var o=i[u];e.put(o.getMode(),4),e.put(o.getLength(),k.getLengthInBits(o.getMode(),a)),o.write(e)}for(var d=0,u=0;u<f.length;u++)d+=f[u].dataCount;if(e.getLengthInBits()<=d*8)break}n=a}_(!1,y())},v.createTableTag=function(a,f){a=a||2,f=typeof f>"u"?a*4:f;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+f+"px;",e+='">',e+="<tbody>";for(var u=0;u<v.getModuleCount();u+=1){e+="<tr>";for(var o=0;o<v.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+a+"px;",e+=" height: "+a+"px;",e+=" background-color: ",e+=v.isDark(u,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>",e},v.createSvgTag=function(a,f,e,u){var o={};typeof arguments[0]=="object"&&(o=arguments[0],a=o.cellSize,f=o.margin,e=o.alt,u=o.title),a=a||2,f=typeof f>"u"?a*4:f,e=typeof e=="string"?{text:e}:e||{},e.text=e.text||null,e.id=e.text?e.id||"qrcode-description":null,u=typeof u=="string"?{text:u}:u||{},u.text=u.text||null,u.id=u.text?u.id||"qrcode-title":null;var d=v.getModuleCount()*a+f*2,c,p,b,C,A="",R;for(R="l"+a+",0 0,"+a+" -"+a+",0 0,-"+a+"z ",A+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',A+=o.scalable?"":' width="'+d+'px" height="'+d+'px"',A+=' viewBox="0 0 '+d+" "+d+'" ',A+=' preserveAspectRatio="xMinYMin meet"',A+=u.text||e.text?' role="img" aria-labelledby="'+F([u.id,e.id].join(" ").trim())+'"':"",A+=">",A+=u.text?'<title id="'+F(u.id)+'">'+F(u.text)+"</title>":"",A+=e.text?'<description id="'+F(e.id)+'">'+F(e.text)+"</description>":"",A+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',A+='<path d="',b=0;b<v.getModuleCount();b+=1)for(C=b*a+f,c=0;c<v.getModuleCount();c+=1)v.isDark(b,c)&&(p=c*a+f,A+="M"+p+","+C+R);return A+='" stroke="transparent" fill="black"/>',A+="</svg>",A},v.createDataURL=function(a,f){a=a||2,f=typeof f>"u"?a*4:f;var e=v.getModuleCount()*a+f*2,u=f,o=e-f;return er(e,e,function(d,c){if(u<=d&&d<o&&u<=c&&c<o){var p=Math.floor((d-u)/a),b=Math.floor((c-u)/a);return v.isDark(b,p)?0:1}else return 1})},v.createImgTag=function(a,f,e){a=a||2,f=typeof f>"u"?a*4:f;var u=v.getModuleCount()*a+f*2,o="";return o+="<img",o+=' src="',o+=v.createDataURL(a,f),o+='"',o+=' width="',o+=u,o+='"',o+=' height="',o+=u,o+='"',e&&(o+=' alt="',o+=F(e),o+='"'),o+="/>",o};var F=function(a){for(var f="",e=0;e<a.length;e+=1){var u=a.charAt(e);switch(u){case"<":f+="&lt;";break;case">":f+="&gt;";break;case"&":f+="&amp;";break;case'"':f+="&quot;";break;default:f+=u;break}}return f};return v};P.stringToBytesFuncs={default:function(x){for(var w=[],g=0;g<x.length;g+=1){var l=x.charCodeAt(g);w.push(l&255)}return w}},P.stringToBytes=P.stringToBytesFuncs.default;var D={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},O={L:1,M:0,Q:3,H:2},L={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},k=(function(){var x=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],w=1335,g=7973,l=21522,n={},s=function(t){for(var r=0;t!=0;)r+=1,t>>>=1;return r};return n.getBCHTypeInfo=function(t){for(var r=t<<10;s(r)-s(w)>=0;)r^=w<<s(r)-s(w);return(t<<10|r)^l},n.getBCHTypeNumber=function(t){for(var r=t<<12;s(r)-s(g)>=0;)r^=g<<s(r)-s(g);return t<<12|r},n.getPatternPosition=function(t){return x[t-1]},n.getMaskFunction=function(t){switch(t){case L.PATTERN000:return function(r,h){return(r+h)%2==0};case L.PATTERN001:return function(r,h){return r%2==0};case L.PATTERN010:return function(r,h){return h%3==0};case L.PATTERN011:return function(r,h){return(r+h)%3==0};case L.PATTERN100:return function(r,h){return(Math.floor(r/2)+Math.floor(h/3))%2==0};case L.PATTERN101:return function(r,h){return r*h%2+r*h%3==0};case L.PATTERN110:return function(r,h){return(r*h%2+r*h%3)%2==0};case L.PATTERN111:return function(r,h){return(r*h%3+(r+h)%2)%2==0};default:throw"bad maskPattern:"+t}},n.getErrorCorrectPolynomial=function(t){for(var r=K([1],0),h=0;h<t;h+=1)r=r.multiply(K([1,M.gexp(h)],0));return r},n.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case D.MODE_NUMBER:return 10;case D.MODE_ALPHA_NUM:return 9;case D.MODE_8BIT_BYTE:return 8;case D.MODE_KANJI:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case D.MODE_NUMBER:return 12;case D.MODE_ALPHA_NUM:return 11;case D.MODE_8BIT_BYTE:return 16;case D.MODE_KANJI:return 10;default:throw"mode:"+t}else if(r<41)switch(t){case D.MODE_NUMBER:return 14;case D.MODE_ALPHA_NUM:return 13;case D.MODE_8BIT_BYTE:return 16;case D.MODE_KANJI:return 12;default:throw"mode:"+t}else throw"type:"+r},n.getLostPoint=function(t){for(var r=t.getModuleCount(),h=0,i=0;i<r;i+=1)for(var v=0;v<r;v+=1){for(var _=0,B=t.isDark(i,v),y=-1;y<=1;y+=1)if(!(i+y<0||r<=i+y))for(var T=-1;T<=1;T+=1)v+T<0||r<=v+T||y==0&&T==0||B==t.isDark(i+y,v+T)&&(_+=1);_>5&&(h+=3+_-5)}for(var i=0;i<r-1;i+=1)for(var v=0;v<r-1;v+=1){var E=0;t.isDark(i,v)&&(E+=1),t.isDark(i+1,v)&&(E+=1),t.isDark(i,v+1)&&(E+=1),t.isDark(i+1,v+1)&&(E+=1),(E==0||E==4)&&(h+=3)}for(var i=0;i<r;i+=1)for(var v=0;v<r-6;v+=1)t.isDark(i,v)&&!t.isDark(i,v+1)&&t.isDark(i,v+2)&&t.isDark(i,v+3)&&t.isDark(i,v+4)&&!t.isDark(i,v+5)&&t.isDark(i,v+6)&&(h+=40);for(var v=0;v<r;v+=1)for(var i=0;i<r-6;i+=1)t.isDark(i,v)&&!t.isDark(i+1,v)&&t.isDark(i+2,v)&&t.isDark(i+3,v)&&t.isDark(i+4,v)&&!t.isDark(i+5,v)&&t.isDark(i+6,v)&&(h+=40);for(var N=0,v=0;v<r;v+=1)for(var i=0;i<r;i+=1)t.isDark(i,v)&&(N+=1);var m=Math.abs(100*N/r/r-50)/5;return h+=m*10,h},n})(),M=(function(){for(var x=new Array(256),w=new Array(256),g=0;g<8;g+=1)x[g]=1<<g;for(var g=8;g<256;g+=1)x[g]=x[g-4]^x[g-5]^x[g-6]^x[g-8];for(var g=0;g<255;g+=1)w[x[g]]=g;var l={};return l.glog=function(n){if(n<1)throw"glog("+n+")";return w[n]},l.gexp=function(n){for(;n<0;)n+=255;for(;n>=256;)n-=255;return x[n]},l})();function K(x,w){if(typeof x.length>"u")throw x.length+"/"+w;var g=(function(){for(var n=0;n<x.length&&x[n]==0;)n+=1;for(var s=new Array(x.length-n+w),t=0;t<x.length-n;t+=1)s[t]=x[t+n];return s})(),l={};return l.getAt=function(n){return g[n]},l.getLength=function(){return g.length},l.multiply=function(n){for(var s=new Array(l.getLength()+n.getLength()-1),t=0;t<l.getLength();t+=1)for(var r=0;r<n.getLength();r+=1)s[t+r]^=M.gexp(M.glog(l.getAt(t))+M.glog(n.getAt(r)));return K(s,0)},l.mod=function(n){if(l.getLength()-n.getLength()<0)return l;for(var s=M.glog(l.getAt(0))-M.glog(n.getAt(0)),t=new Array(l.getLength()),r=0;r<l.getLength();r+=1)t[r]=l.getAt(r);for(var r=0;r<n.getLength();r+=1)t[r]^=M.gexp(M.glog(n.getAt(r))+s);return K(t,0).mod(n)},l}var Y=(function(){var x=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],w=function(n,s){var t={};return t.totalCount=n,t.dataCount=s,t},g={},l=function(n,s){switch(s){case O.L:return x[(n-1)*4+0];case O.M:return x[(n-1)*4+1];case O.Q:return x[(n-1)*4+2];case O.H:return x[(n-1)*4+3];default:return}};return g.getRSBlocks=function(n,s){var t=l(n,s);if(typeof t>"u")throw"bad rs block @ typeNumber:"+n+"/errorCorrectionLevel:"+s;for(var r=t.length/3,h=[],i=0;i<r;i+=1)for(var v=t[i*3+0],_=t[i*3+1],B=t[i*3+2],y=0;y<v;y+=1)h.push(w(_,B));return h},g})(),G=function(){var x=[],w=0,g={};return g.getBuffer=function(){return x},g.getAt=function(l){var n=Math.floor(l/8);return(x[n]>>>7-l%8&1)==1},g.put=function(l,n){for(var s=0;s<n;s+=1)g.putBit((l>>>n-s-1&1)==1)},g.getLengthInBits=function(){return w},g.putBit=function(l){var n=Math.floor(w/8);x.length<=n&&x.push(0),l&&(x[n]|=128>>>w%8),w+=1},g},$=function(x){var w=D.MODE_NUMBER,g=x,l={};l.getMode=function(){return w},l.getLength=function(t){return g.length},l.write=function(t){for(var r=g,h=0;h+2<r.length;)t.put(n(r.substring(h,h+3)),10),h+=3;h<r.length&&(r.length-h==1?t.put(n(r.substring(h,h+1)),4):r.length-h==2&&t.put(n(r.substring(h,h+2)),7))};var n=function(t){for(var r=0,h=0;h<t.length;h+=1)r=r*10+s(t.charAt(h));return r},s=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-48;throw"illegal char :"+t};return l},W=function(x){var w=D.MODE_ALPHA_NUM,g=x,l={};l.getMode=function(){return w},l.getLength=function(s){return g.length},l.write=function(s){for(var t=g,r=0;r+1<t.length;)s.put(n(t.charAt(r))*45+n(t.charAt(r+1)),11),r+=2;r<t.length&&s.put(n(t.charAt(r)),6)};var n=function(s){if("0"<=s&&s<="9")return s.charCodeAt(0)-48;if("A"<=s&&s<="Z")return s.charCodeAt(0)-65+10;switch(s){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+s}};return l},V=function(x){var w=D.MODE_8BIT_BYTE,g=x,l=P.stringToBytes(x),n={};return n.getMode=function(){return w},n.getLength=function(s){return l.length},n.write=function(s){for(var t=0;t<l.length;t+=1)s.put(l[t],8)},n},q=function(x){var w=D.MODE_KANJI,g=x,l=P.stringToBytesFuncs.SJIS;if(!l)throw"sjis not supported.";(function(t,r){var h=l(t);if(h.length!=2||(h[0]<<8|h[1])!=r)throw"sjis not supported."})("\u53CB",38726);var n=l(x),s={};return s.getMode=function(){return w},s.getLength=function(t){return~~(n.length/2)},s.write=function(t){for(var r=n,h=0;h+1<r.length;){var i=(255&r[h])<<8|255&r[h+1];if(33088<=i&&i<=40956)i-=33088;else if(57408<=i&&i<=60351)i-=49472;else throw"illegal char at "+(h+1)+"/"+i;i=(i>>>8&255)*192+(i&255),t.put(i,13),h+=2}if(h<r.length)throw"illegal char at "+(h+1)},s};return P})();
  (function(){qrcode.stringToBytesFuncs["UTF-8"]=function(P){function D(O){for(var L=[],k=0;k<O.length;k++){var M=O.charCodeAt(k);M<128?L.push(M):M<2048?L.push(192|M>>6,128|M&63):M<55296||M>=57344?L.push(224|M>>12,128|M>>6&63,128|M&63):(k++,M=65536+((M&1023)<<10|O.charCodeAt(k)&1023),L.push(240|M>>18,128|M>>12&63,128|M>>6&63,128|M&63))}return L}return D(P)}})();

  function generateQRCodeSVG(text, size, margin) {
    margin = (typeof margin === "number") ? margin : 4;
    size = size || 160;
    var qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    var count = qr.getModuleCount();
    var total = count + margin * 2;
    var pathData = "";
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          pathData += "M" + (c + margin) + "," + (r + margin) + "h1v1h-1z ";
        }
      }
    }
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + total + " " + total + "\" width=\"" + size + "\" height=\"" + size + "\" shape-rendering=\"crispEdges\"><rect width=\"100%\" height=\"100%\" fill=\"#FFFFFF\"/><path fill=\"#0F172A\" d=\"" + pathData + "\"/></svg>";
  }

  // Safe Storage
  const safeStorage = window.safeStorage || {
    getItem: function(key) {
      try { return window.localStorage ? window.localStorage.getItem(key) : null; } catch(e) { return null; }
    },
    setItem: function(key, val) {
      try { if (window.localStorage) window.localStorage.setItem(key, val); } catch(e) {}
    },
    removeItem: function(key) {
      try { if (window.localStorage) window.localStorage.removeItem(key); } catch(e) {}
    }
  };

  // Generate or retrieve anonymous device ID
  function getDeviceId() {
    let deviceId = safeStorage.getItem('dumpy_device_id');
    if (!deviceId) {
      // Generate UUID v4-like identifier
      deviceId = 'DEV-' + 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
      safeStorage.setItem('dumpy_device_id', deviceId);
    }
    return deviceId;
  }

  // State
  const state = {
    roomId: '',
    deviceId: getDeviceId(),
    config: window.getSupabaseConfig ? window.getSupabaseConfig() : {},
    uploadQueue: [],
    recentUploads: []
  };

  // DOM Elements
  const el = {
    roomCodeDisplay: document.getElementById('roomCodeDisplay'),
    btnToggleQR: document.getElementById('btnToggleQR'),
    webQRCard: document.getElementById('webQRCard'),
    webQrContainer: document.getElementById('webQrContainer'),
    webQrCanvas: document.getElementById('webQrCanvas'),
    btnCopyWebLink: document.getElementById('btnCopyWebLink'),
    btnChangeRoom: document.getElementById('btnChangeRoom'),
    btnSettings: document.getElementById('btnSettings'),
    uploadCard: document.getElementById('uploadCard'),
    fileInput: document.getElementById('fileInput'),
    cameraInput: document.getElementById('cameraInput'),
    btnCamera: document.getElementById('btnCamera'),
    btnGallery: document.getElementById('btnGallery'),
    queueSection: document.getElementById('queueSection'),
    queueList: document.getElementById('queueList'),
    
    // Room Modal
    roomModal: document.getElementById('roomModal'),
    btnCloseRoomModal: document.getElementById('btnCloseRoomModal'),
    inputRoomCode: document.getElementById('inputRoomCode'),
    btnSaveRoom: document.getElementById('btnSaveRoom'),
    
    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    inputSupabaseUrl: document.getElementById('inputSupabaseUrl'),
    inputSupabaseKey: document.getElementById('inputSupabaseKey'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    
    // Toast
    toastBar: document.getElementById('toastBar'),
    toastText: document.getElementById('toastText')
  };

  // Extract Room ID from URL query param `?room=XYZ` or safeStorage
  function initRoomId() {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');

    if (roomFromUrl && roomFromUrl.trim()) {
      state.roomId = roomFromUrl.trim().toUpperCase();
      safeStorage.setItem('dumpy_active_room', state.roomId);
    } else {
      const savedRoom = safeStorage.getItem('dumpy_active_room');
      if (savedRoom) {
        state.roomId = savedRoom;
      } else {
        // Generate secure 10-char room ID
        state.roomId = 'DMP-' + 'XXXXXXXX'.replace(/X/g, () => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 32)]);
        safeStorage.setItem('dumpy_active_room', state.roomId);
      }
    }

    el.roomCodeDisplay.textContent = state.roomId;
    updatePairingUI();
  }

  function getPairingUrl() {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      const u = new URL(window.location.href);
      u.searchParams.set('room', state.roomId);
      return u.toString().split('#')[0];
    }
    return `https://dumpy-figma-plugin.vercel.app/web/index.html?room=${encodeURIComponent(state.roomId)}`;
  }

  function updatePairingUI() {
    el.roomCodeDisplay.textContent = state.roomId;
    const pairingUrl = getPairingUrl();
    try {
      if (el.webQrContainer) {
        const svgMarkup = generateQRCodeSVG(pairingUrl, 160, 4);
        el.webQrContainer.innerHTML = svgMarkup;
      }
    } catch (e) {
      console.warn("Vector SVG QR generation failed, using fallback:", e);
      if (el.webQrContainer) {
        el.webQrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(pairingUrl)}&color=0F172A" alt="QR" />`;
      }
    }
  }

  // Show Toast
  function showToast(msg, duration = 2500) {
    el.toastText.textContent = msg;
    el.toastBar.classList.add('active');
    setTimeout(() => el.toastBar.classList.remove('active'), duration);
  }

  // Trigger light mobile vibration for tactile feedback
  function triggerHaptic() {
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) {}
    }
  }

  // Helper: Read image dimensions
  function getImageDimensions(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth || 0, height: img.naturalHeight || 0, previewUrl: url });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0, previewUrl: url });
      };
      img.src = url;
    });
  }

  // Direct Supabase Storage + Database Upload with device_id tracking
  async function uploadScreenshot(fileItem) {
    const { file, id } = fileItem;
    const config = window.getSupabaseConfig();
    const itemCard = document.getElementById(`upload-${id}`);
    const progressBar = itemCard ? itemCard.querySelector('.progress-bar') : null;
    const statusBadge = itemCard ? itemCard.querySelector('.queue-status-badge') : null;

    if (!config.url || !config.key) {
      if (statusBadge) {
        statusBadge.className = 'queue-status-badge status-error';
        statusBadge.innerHTML = '⚠️ Set Supabase credentials';
      }
      showToast('Please set your Supabase URL & Key in Settings');
      el.settingsModal.classList.add('open');
      return;
    }

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${encodeURIComponent(state.roomId)}/${timestamp}_${sanitizedName}`;
      
      if (progressBar) progressBar.style.width = '30%';

      // 1. Upload to Supabase Storage via REST API
      const uploadUrl = `${config.url}/storage/v1/object/${config.bucket}/${storagePath}`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': file.type || 'image/png',
          'x-upsert': 'true'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Storage upload failed (${uploadResponse.status}): ${errorText}`);
      }

      if (progressBar) progressBar.style.width = '70%';

      // 2. Construct public CDN URL
      const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${storagePath}`;

      // 3. Insert metadata record into `dumpy_screenshots` table with device_id
      const insertUrl = `${config.url}/rest/v1/dumpy_screenshots`;
      const recordPayload = {
        room_id: state.roomId,
        device_id: state.deviceId,
        file_name: file.name,
        file_url: publicUrl,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type || 'image/png',
        is_inserted: false
      };

      const dbResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(recordPayload)
      });

      if (!dbResponse.ok) {
        const dbErrText = await dbResponse.text();
        throw new Error(`Database record failed: ${dbErrText}`);
      }

      if (progressBar) progressBar.style.width = '100%';

      // 4. Update UI to Success
      if (statusBadge) {
        statusBadge.className = 'queue-status-badge status-success';
        statusBadge.innerHTML = `
          <svg class="icon" style="width:14px; height:14px;" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Delivered to Figma
        `;
      }

      triggerHaptic();
      showToast(`⚡ Delivered "${file.name}" to Figma inbox!`);

    } catch (err) {
      console.error('Upload failed:', err);
      if (statusBadge) {
        statusBadge.className = 'queue-status-badge status-error';
        statusBadge.innerHTML = '✕ Upload failed';
      }
      showToast(`Upload error: ${err.message}`);
    }
  }

  // Handle incoming file list
  async function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    el.queueSection.style.display = 'block';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;

      const fileId = 'f_' + Math.random().toString(36).substring(2, 9);
      const dimensions = await getImageDimensions(file);

      const fileItem = {
        id: fileId,
        file: file,
        width: dimensions.width,
        height: dimensions.height,
        previewUrl: dimensions.previewUrl
      };

      const card = document.createElement('div');
      card.className = 'queue-card';
      card.id = `upload-${fileId}`;

      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const dimStr = dimensions.width && dimensions.height ? `${dimensions.width}×${dimensions.height}` : 'Image';

      card.innerHTML = `
        <img src="${dimensions.previewUrl}" class="queue-thumb" alt="Preview" />
        <div class="queue-info">
          <div class="queue-filename">${file.name}</div>
          <div class="queue-meta">
            <span>${dimStr}</span>
            <span>•</span>
            <span>${sizeStr}</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar"></div>
          </div>
        </div>
        <div class="queue-status-badge status-uploading">
          <svg class="icon" style="width:14px; height:14px; animation: pulse 1s infinite;" viewBox="0 0 24 24">
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Beaming...
        </div>
      `;

      el.queueList.prepend(card);
      uploadScreenshot(fileItem);
    }
  }

  // Event Listeners - Pure Room-based, no auth
  
  // Fixed Upload Flow: Main card and shutter button DO NOT trigger inputs directly
  // They're just visual indicators. Users must explicitly click Camera or Gallery buttons.
  
  // Hero dropzone tap triggers photo library selection directly
  el.uploadCard.addEventListener('click', () => {
    triggerHaptic();
    el.fileInput.click();
  });

  // File input change handlers with value reset
  el.fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  });

  el.cameraInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  });

  // Dedicated Action Buttons
  el.btnCamera.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerHaptic();
    el.cameraInput.click();
  });
  
  el.btnGallery.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerHaptic();
    el.fileInput.click();
  });

  // QR Code Toggle
  if (el.btnToggleQR) {
    el.btnToggleQR.addEventListener('click', () => {
      const isHidden = el.webQRCard.style.display === 'none';
      el.webQRCard.style.display = isHidden ? 'flex' : 'none';
      if (isHidden) {
        updatePairingUI();
      }
    });
  }

  // Copy Pairing Link
  if (el.btnCopyWebLink) {
    el.btnCopyWebLink.addEventListener('click', () => {
      const url = getPairingUrl();
      navigator.clipboard.writeText(url).then(() => {
        showToast("📋 Pairing link copied to clipboard!");
      }).catch(() => {
        showToast("Room URL: " + url);
      });
    });
  }

  // Room code click to copy
  el.roomCodeDisplay.addEventListener('click', () => {
    const url = getPairingUrl();
    navigator.clipboard.writeText(url).then(() => {
      showToast(`📋 Copied Room ${state.roomId}!`);
    }).catch(() => {
      showToast(`Room: ${state.roomId}`);
    });
  });

  // Drag & Drop - Keep this working, but with better visual feedback
  el.uploadCard.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.uploadCard.classList.add('drag-over');
    el.uploadCard.querySelector('.upload-title').textContent = 'Drop Screenshots Here';
  });

  el.uploadCard.addEventListener('dragleave', () => {
    el.uploadCard.classList.remove('drag-over');
    el.uploadCard.querySelector('.upload-title').textContent = 'Ready to Upload';
  });

  el.uploadCard.addEventListener('drop', (e) => {
    e.preventDefault();
    el.uploadCard.classList.remove('drag-over');
    el.uploadCard.querySelector('.upload-title').textContent = 'Ready to Upload';
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
      showToast(`📸 Processing ${e.dataTransfer.files.length} screenshot(s)`);
    }
  });

  // Clipboard Paste
  window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      handleFiles(e.clipboardData.files);
      showToast("Pasted screenshot from clipboard");
    }
  });

  // Room Switching Modal
  el.btnChangeRoom.addEventListener('click', () => {
    el.inputRoomCode.value = state.roomId;
    el.roomModal.classList.add('open');
  });

  el.btnCloseRoomModal.addEventListener('click', () => {
    el.roomModal.classList.remove('open');
  });

  el.btnSaveRoom.addEventListener('click', () => {
    const val = el.inputRoomCode.value.trim().toUpperCase();
    if (val && val.length >= 8) {
      state.roomId = val;
      safeStorage.setItem('dumpy_active_room', state.roomId);
      el.roomCodeDisplay.textContent = state.roomId;
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('room', state.roomId);
      window.history.replaceState({}, '', newUrl.toString());

      updatePairingUI();
      el.roomModal.classList.remove('open');
      showToast(`Switched to room ${state.roomId}`);
    } else {
      showToast('Please enter a valid Room ID (e.g., DMP-7K9X2M4P)');
    }
  });

  // Settings Modal
  el.btnSettings.addEventListener('click', () => {
    const cfg = window.getSupabaseConfig();
    el.inputSupabaseUrl.value = cfg.url;
    el.inputSupabaseKey.value = cfg.key;
    el.settingsModal.classList.add('open');
  });

  el.btnCloseSettings.addEventListener('click', () => {
    el.settingsModal.classList.remove('open');
  });

  el.btnSaveSettings.addEventListener('click', () => {
    const url = el.inputSupabaseUrl.value.trim();
    const key = el.inputSupabaseKey.value.trim();
    window.saveSupabaseConfig(url, key);
    state.config = window.getSupabaseConfig();
    el.settingsModal.classList.remove('open');
    showToast('Supabase settings saved!');
  });

  // Boot
  initRoomId();
})(window);