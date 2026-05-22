(function(){
var W=58,H=17;
var P={idle:"#64748b",low:"#38bdf8",mid:"#34d399",high:"#fbbf24",turbo:"#fb7185",
fissL:"#a78bfa",fissH:"#e879f9",title:"#67e8f9",brand:"#6c63ff",label:"#94a3b8",
value:"#e2e8f0",dim:"#475569",good:"#34d399",warn:"#fbbf24",hot:"#fb7185",
white:"#ffffff",gold:"#fde047",pink:"#f472b6"};
var CI=[".","`",","," "],CL=[".","- ","~","`",","," "],
CM=["+","~","-","=","o",";",":"],CH=["#","=","W","+","X","H"],
CT=["@","#","M","W","&","%","$"],FL=["|",":","|","."],FH=["|","/","\\",":","|","!"];
var mask=[],fiss=[];
for(var r=0;r<H;r++){
mask.push([]);fiss.push([]);
var cx=W/2,cy=H*0.42,rx=W*0.46,ry=H*0.42;
for(var c=0;c<W;c++){
var dx=(c-cx)/rx,dy=(r-cy)/ry,wob=0.04*Math.sin(r*1.2)+0.03*Math.sin(c*0.8);
mask[r].push(dx*dx+dy*dy<=1+wob&&r<H*0.88&&!(r>H*0.80&&Math.abs(c-cx)<W*0.07));
fiss[r].push(false);}
var icx=Math.floor(W/2);
for(var o=-1;o<=1;o++){var c2=icx+o;if(c2>=0&&c2<W&&mask[r][c2]&&r<Math.floor(H*0.72))fiss[r][c2]=true;}}
for(var si=0,srows=[Math.floor(H*0.3),Math.floor(H*0.55),Math.floor(H*0.70)];si<srows.length;si++){
var sr=srows[si],icx2=Math.floor(W/2);
for(var c=5;c<W-5;c++){var row=sr+Math.round(1.5*Math.sin(c*0.4));
if(row>=0&&row<H&&mask[row][c]&&Math.abs(c-icx2)>3)fiss[row][c]=true;}}
var phase=0,frame=0,pb=0,iid=null,sc="moderate",rms=130,sinf=0,slast=0;
var SC={
idle:{cpu:function(){return 1+Math.random()*3},act:function(){return 3+Math.random()*5},inf:0},
moderate:{cpu:function(){return 35+Math.sin(Date.now()/1200)*12+Math.random()*8},act:function(){return 45+Math.sin(Date.now()/900)*15+Math.random()*10},inf:0.003},
intense:{cpu:function(){return 78+Math.sin(Date.now()/600)*10+Math.random()*8},act:function(){return 82+Math.sin(Date.now()/500)*8+Math.random()*6},inf:0.008},
peak:{cpu:function(){return 95+Math.random()*4},act:function(){return 96+Math.random()*3},inf:0.012}};
function col(h,t){return"<span style='color:"+h+"'>"+t+"</span>";}
function bar(f,w,fc){var n=Math.round(Math.max(0,Math.min(1,f))*w);return col("#94a3b8","[")+col(fc,"#".repeat(n))+col("#475569","-".repeat(w-n))+col("#94a3b8","]");}
function cpuC(p){return p<5?P.dim:p<25?P.low:p<55?P.good:p<85?P.warn:P.hot;}
function actC(l){return l<5?P.dim:l<20?P.low:l<45?P.mid:l<70?P.warn:P.hot;}
function actL(l){return l<5?"dormant":l<20?"idle":l<45?"moderate":l<70?"high":l<90?"intense":"BLAZING";}
function pad2(n){return("0"+n).slice(-2);}
function renderBrain(al,fi){
var t=phase*0.8,t07=t*0.7,t13=t*1.3,t04=t*0.4,t09=t*0.9;
var pf=0.8+(Math.min(al,100)/100)*3.5,pulse=(Math.sin(phase*pf)+1)/2,ab=Math.min(al/50,2);
var idle=al<5,hi=al>40,pm=pb>0,cc=[P.white,P.gold,P.pink],rows=[];
for(var r=0;r<H;r++){
var c03=Math.cos(r*0.3+t07),c05=Math.cos(r*0.5+t04),html="",lc="";
for(var c=0;c<W;c++){
if(!mask[r][c]){html+=" ";continue;}
if(fiss[r][c]){
var fc2=pm?P.white:hi?P.fissH:P.fissL,arr=hi?FH:FL;
var fi2=Math.floor(Math.abs(fi*0.4+c*0.7+r*0.5))%arr.length;
if(fc2!==lc){html+="<span style='color:"+fc2+"'>";lc=fc2;}
html+=arr[fi2];continue;}
var n=Math.sin(c*0.4+t)*c03+Math.sin(c*0.7-t13)*c05+Math.sin((c+r)*0.25+t09)*0.5;
var norm=(n+2)/4,wp=norm*(0.4+pulse*0.6)*ab;
var ch,fc3;
if(pm){ch=CT[Math.floor(Math.abs(n*13))%CT.length];fc3=cc[fi%3];}
else if(idle){ch=CI[Math.floor(Math.abs(n*13))%CI.length];fc3=P.idle;}
else if(wp<0.2){ch=CL[Math.floor(Math.abs(n*13))%CL.length];fc3=P.low;}
else if(wp<0.5){ch=CM[Math.floor(Math.abs(n*13))%CM.length];fc3=P.mid;}
else if(wp<0.85){ch=CH[Math.floor(Math.abs(n*13))%CH.length];fc3=P.high;}
else{ch=CT[Math.floor(Math.abs(n*13))%CT.length];fc3=P.turbo;}
if(fc3!==lc){html+="<span style='color:"+fc3+"'>";lc=fc3;}
html+=ch;}
rows.push(html+"</span>");}
return rows.join("\n");}
function tick(){
var s=SC[sc],cpu=Math.max(0,Math.min(100,s.cpu())),al=Math.max(0,Math.min(100,s.act()));
if(Math.random()<s.inf){sinf++;slast=Date.now();}
if(sc==="peak")pb=1;else if(pb>0)pb=Math.max(0,pb-1/24);
var ts=Math.floor(frame*rms/1000);
var elapsed=pad2(Math.floor(ts/3600))+":"+pad2(Math.floor((ts%3600)/60))+":"+pad2(ts%60);
var banner=pb>0?"  "+col((frame%4)<2?P.gold:P.pink,"*** PEAK: 97% activity ***"):"";
var t1=document.getElementById("wm-title");
var t2=document.getElementById("wm-brain");
var t3=document.getElementById("wm-s1");
var t4=document.getElementById("wm-s2");
var t5=document.getElementById("wm-ft");
if(!t1)return;
t1.innerHTML="  "+col(P.title,"OllamaBrain")+" "+col(P.dim,"::")+" "+col(P.brand,"ollama brain")+" "+col(P.dim,"::")+" "+col(P.value,elapsed)+col(P.warn," [SIMULATED]")+banner;
t2.innerHTML=renderBrain(al,frame);
var cc2=cpuC(cpu),ac=actC(al);
t3.innerHTML="  "+col(P.label,"model: ")+col(P.brand,"llama3.2")+col(P.label," (Q4_K-M) | cpu ")+col(cc2,cpu.toFixed(1)+"%")+" "+bar(cpu/100,12,cc2)+" "+col(P.label,"| ")+col(ac,actL(al))+" "+bar(al/100,16,ac);
var ago=slast>0?((Date.now()-slast)/1000).toFixed(0)+"s ago":"never";
t4.innerHTML="  "+col(P.label,"inferences: ")+col(P.value,sinf+" ok")+col(P.label," | last: ")+col(P.value,ago)+col(P.label," | ram: ")+col(P.value,"3840 MB")+col(P.label," | sys: ")+col(P.value,"18.4")+col(P.label,"/32.0 GiB free");
t5.innerHTML="  log: %LOCALAPPDATA%\\Ollama\\server.log  [watching] | frame: "+frame;
phase+=0.18;frame++;}
function restart(){
if(iid)clearInterval(iid);
rms=parseInt(document.getElementById("wm-spd").value);
iid=setInterval(tick,rms);}
function init(){
var selEl=document.getElementById("wm-sc");
var spdEl=document.getElementById("wm-spd");
if(!selEl||!spdEl)return;
selEl.addEventListener("change",function(e){sc=e.target.value;sinf=0;slast=0;pb=0;});
spdEl.addEventListener("input",restart);
restart();}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}
else{init();}
})();
