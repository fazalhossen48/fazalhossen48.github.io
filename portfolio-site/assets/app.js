const $=s=>document.querySelector(s),cache={};
const get=n=>cache[n]??=fetch(`content/${n}.json`,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error(n);return r.json()});
const safe=u=>{try{const x=new URL(u,location.href);return['http:','https:','mailto:','tel:'].includes(x.protocol)?x.href:'#'}catch{return'#'}};
// h() builds elements with textContent only, so editor text is never parsed as HTML.
const h=(t,a={},...c)=>{const e=document.createElement(t);
 for(const[k,v]of Object.entries(a)){if(v==null||v===false)continue;k==='class'?e.className=v:k==='href'?e.href=safe(v):e.setAttribute(k,v)}
 for(const x of c.flat())if(x!=null&&x!==false)e.append(x.nodeType?x:String(x));return e};
const paras=t=>String(t||'').split(/\n\s*\n/).filter(Boolean).map(p=>h('p',{},p));
const link=(u,l,c)=>u?h('a',{href:u,class:c,rel:'noopener'},l||'Open'):null;
const tagList=a=>a&&a.length?h('ul',{class:'tags'},a.map(t=>h('li',{},t))):null;
const items=(a,f,l)=>a&&a.length?h('div',{class:'items '+l},a.map(f)):null;
const ytId=u=>(String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)||[])[1];
const card=x=>h('article',{class:'card'},x.img?h('img',{src:x.img,alt:x.alt||'',loading:'lazy'}):null,
 h('div',{class:'body'},h('h3',{},x.title),x.meta?h('p',{class:'meta'},x.meta):null,paras(x.text),tagList(x.tags),link(x.url,x.label)));
const facade=(id,t)=>{const b=h('button',{class:'facade',type:'button','aria-label':'Play video: '+t,
 style:`background-image:url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`},h('span',{},'Play'));
 b.onclick=()=>b.replaceWith(h('iframe',{class:'v',title:t,allowfullscreen:'',allow:'autoplay; encrypted-media; picture-in-picture',
 src:`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}));return b};

const R={
 async about(){const p=await get('profile');return[paras(p.about),tagList(p.highlights)]},
 async research(l){const d=await get('research');return[paras(d.intro),tagList(d.interests),
  items(d.items,x=>card({title:x.title,meta:x.kind,text:x.summary,url:x.link,label:'Read more'}),l)]},
 async content(l){const d=await get('creative');return[paras(d.intro),
  items(d.videos,v=>{const id=ytId(v.url);return h('article',{class:'card'},id?facade(id,v.title):null,
   h('div',{class:'body'},h('h3',{},v.title),paras(v.description),id?null:link(v.url,'Watch')))},l),
  d.photos&&d.photos.length?h('div',{class:'photos'},d.photos.map(p=>h('figure',{},
   h('img',{src:p.image,alt:p.alt||'',loading:'lazy'}),p.caption?h('figcaption',{class:'meta'},p.caption):null))):null]},
 async projects(l){const d=await get('projects');return[paras(d.intro),
  items([...(d.items||[])].sort((a,b)=>!!b.featured-!!a.featured),
   x=>card({img:x.image,alt:x.alt,title:x.title,meta:x.featured?'Featured':'',text:x.summary,tags:x.tags,url:x.link,label:'View project'}),l)]},
 async skills(l){const d=await get('skills');return items(d.groups,g=>h('article',{class:'card'},h('div',{class:'body'},h('h3',{},g.name),tagList(g.items))),l)},
 async leadership(l){const d=await get('leadership');return items(d.items,x=>card({title:x.role,meta:x.organization,text:x.summary,url:x.link,label:'Learn more'}),l)},
 async contact(){const p=await get('profile');const L=[];
  if(p.email)L.push(link('mailto:'+p.email,p.email,'btn'));
  (p.socials||[]).forEach(s=>s.url&&L.push(link(s.url,s.label,'btn alt')));
  return[paras(p.contact_text),p.location?h('p',{class:'meta'},p.location):null,h('div',{},L)]}
};

function theme(s){const r=document.documentElement.style,t=s.theme||{},f=s.fonts||{};
 ['bg','surface','text','muted','accent'].forEach(k=>t[k]&&r.setProperty('--'+k,t[k]));
 if(f.heading)r.setProperty('--hf',`'${f.heading}',Georgia,serif`);
 if(f.body)r.setProperty('--bf',`'${f.body}','Noto Sans Bengali',system-ui,sans-serif`);
 if(s.radius!=null)r.setProperty('--radius',s.radius+'px');
 const q=[f.heading,f.body,'Noto Sans Bengali'].filter(Boolean).map(n=>'family='+encodeURIComponent(n).replace(/%20/g,'+')+':wght@400;500;600').join('&');
 document.head.append(h('link',{rel:'stylesheet',href:`https://fonts.googleapis.com/css2?${q}&display=swap`}))}

function hero(p,s,secs){const e=$('#top');e.className='hero'+(s.hero_layout==='centered'?' centered':'');
 const ini=p.name.split(' ').map(w=>w[0]).slice(0,2).join('');
 e.replaceChildren(h('div',{},h('h1',{},p.name),h('p',{class:'role'},p.role),h('p',{class:'lead'},p.tagline),
  link(p.cta_url||'#about',p.cta_label||'About me','btn'),secs.some(x=>x.id==='contact')?link('#contact','Contact','btn alt'):null),
  p.portrait?h('img',{class:'portrait',src:p.portrait,alt:p.portrait_alt||p.name}):h('div',{class:'portrait','aria-hidden':'true'},ini))}

function nav(secs,p){$('#brand').textContent=p.name;const n=$('#nav'),b=$('#menu');
 n.replaceChildren(...secs.map(x=>h('a',{href:'#'+x.id},x.title||x.id)));
 b.onclick=()=>b.setAttribute('aria-expanded',n.classList.toggle('open'));
 n.onclick=e=>{if(e.target.tagName==='A'){n.classList.remove('open');b.setAttribute('aria-expanded','false')}}}

(async()=>{try{
 const[s,p]=await Promise.all([get('settings'),get('profile')]);
 theme(s);document.title=s.site_title||p.name;$('meta[name=description]').content=s.description||'';
 const secs=(s.sections||[]).filter(x=>x.visible!==false&&R[x.id]);
 nav(secs,p);hero(p,s,secs);
 for(const x of secs)$('#sections').append(h('section',{id:x.id,class:'s','aria-labelledby':x.id+'-h'},
  h('h2',{id:x.id+'-h'},x.title||x.id),await R[x.id](x.layout||'grid')));
 $('#foot').replaceChildren(h('p',{class:'foot meta'},`© ${new Date().getFullYear()} ${p.name}`));
}catch(e){console.error(e);$('#sections').replaceChildren(h('p',{class:'foot'},'Content could not be loaded. Check the files in the content folder for a typo.'))}})();
