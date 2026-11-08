/* Issue #12: Atsuko-themed alternative to the original self-contained crepe maker.
   Keep ingredient/recipe data and selection logic aligned with crepe_party_photo.html.
   Photos now reuse the site's gallery files rather than embedded base64 images. */
const mains=['たまごサラダ','カニサラダ','スモークサーモン','えび2種','ボイルソーセージ','ベーコン・ハム','タンドリーチキン風','ガーリックビーフ','タコスミート'];
const subs=['レタス・サンチュ','きのこマリネ','ほうれん草炒め','アボカド','スライスオニオン','パクチー','きゅうり','紫蘇'];
const tops=['たらこマヨ','ビンダルマヨ','フレッシュサルサ','マッシュルームクリーム','クリームチーズ','シュレッドチーズ','ブリーチーズ'];
const recipes={
'たまごサラダ':[['たまごアボカド','アボカド,レタス・サンチュ','クリームチーズ','まろやかで優しい、定番のサラダクレープ'],['たらこ和風','紫蘇,レタス・サンチュ','たらこマヨ','たらこの塩気と紫蘇の香りで和風に'],['きのこたまご','きのこマリネ,ほうれん草炒め','マッシュルームクリーム','きのこのコクで洋食屋さん風']],
'カニサラダ':[['カニきゅうり','きゅうり,レタス・サンチュ','クリームチーズ','シャキシャキ爽やかなサラダ仕立て'],['カニアボカド','アボカド,スライスオニオン','クリームチーズ','濃厚でクリーミー'],['カニたらこ和風','紫蘇,きゅうり','たらこマヨ','魚介のうま味と紫蘇が合う']],
'スモークサーモン':[['サーモンクリーム','アボカド,レタス・サンチュ','クリームチーズ','まろやかな王道の組み合わせ'],['サーモンオニオン','スライスオニオン,レタス・サンチュ','クリームチーズ','オニオンで後味さっぱり'],['サーモンブリー','アボカド,レタス・サンチュ','ブリーチーズ','リッチで濃厚なご褒美クレープ']],
'えび2種':[['えびアボカド','アボカド,レタス・サンチュ','クリームチーズ','クリーミーで万人受け'],['スパイシーえび','パクチー,スライスオニオン','ビンダルマヨ','香りと辛みが効いたエスニック風'],['えびたらこ','紫蘇,きゅうり','たらこマヨ','魚介のうま味が重なる和風']],
'ボイルソーセージ':[['ソーセージチーズ','レタス・サンチュ','シュレッドチーズ','ホットドッグ風で食べごたえ抜群'],['ソーセージきのこ','きのこマリネ,ほうれん草炒め','マッシュルームクリーム','クリーミーな洋食風'],['ソーセージスパイシー','スライスオニオン,レタス・サンチュ','ビンダルマヨ','パンチのある大人の味']],
'ベーコン・ハム':[['ベーコンほうれん草','ほうれん草炒め','シュレッドチーズ','香ばしくてコクのある定番'],['ベーコンきのこ','きのこマリネ,ほうれん草炒め','マッシュルームクリーム','カフェのガレット風'],['ハムブリー','レタス・サンチュ,スライスオニオン','ブリーチーズ','塩気と濃厚チーズでリッチに']],
'タンドリーチキン風':[['タンドリークリーム','レタス・サンチュ,スライスオニオン','クリームチーズ','スパイスをクリームがまろやかに'],['エスニックチキン','パクチー,きゅうり','ビンダルマヨ','香り豊かでスパイシー'],['チキンチーズ','アボカド,レタス・サンチュ','シュレッドチーズ','満足感たっぷり']],
'ガーリックビーフ':[['ビーフオニオン','スライスオニオン,レタス・サンチュ','クリームチーズ','にんにくの香りをクリームが包む'],['ビーフきのこ','きのこマリネ,ほうれん草炒め','マッシュルームクリーム','ステーキハウス風の濃厚な味'],['スパイシービーフ','パクチー,アボカド','ビンダルマヨ','刺激的で食べごたえあり']],
'タコスミート':[['王道タコス','レタス・サンチュ,スライスオニオン','シュレッドチーズ,フレッシュサルサ','タコスらしい爽やかな辛みとコク'],['アボカドタコス','アボカド,パクチー','フレッシュサルサ','フレッシュでメキシカンな味'],['スパイシータコス','スライスオニオン,レタス・サンチュ','ビンダルマヨ','スパイス好きにおすすめ']]
};
let state={main:null,subs:[],tops:[],recipe:null};const $=id=>document.getElementById(id);const photos=[
  "images/01_たまごアボカド.png",
  "images/02_カニサラダ.png",
  "images/03_スモークサーモンクリームクレープ.png",
  "images/04_えびアボカド.png",
  "images/05_ソーセージチーズ.png",
  "images/06_ベーコンきのこ.png",
  "images/07_タンドリーチキン.png",
  "images/08_タコスミート.png",
  "images/09_きのこクリーム.png",
  "images/10_ブリーチーズ.png",
  "images/11_たらこ和風クレープ.png",
  "images/12_アボカドクリームチーズ.png",
  "images/03_スモークサーモンクリームクレープ.png",
  "images/11_たらこ和風クレープ.png"
];
const photoMap={"たまごサラダ": 0, "カニサラダ": 1, "スモークサーモン": 12, "えび2種": 3, "ボイルソーセージ": 4, "ベーコン・ハム": 5, "タンドリーチキン風": 6, "ガーリックビーフ": 5, "タコスミート": 7};
function photoIndex(ingredients){const main=ingredients[0];if(main==='スモークサーモン')return ingredients.includes('ブリーチーズ')?9:12;if(main==='たまごサラダ'&&ingredients.includes('たらこマヨ'))return 13;if(ingredients.includes('マッシュルームクリーム'))return 8;if(main==='ガーリックビーフ')return 7;return photoMap[main]??0}
function art(ingredients){const idx=photoIndex(ingredients);return `<div class="art"><img src="${photos[idx]}" alt="${ingredients[0]}を使ったクレープの参考写真" loading="lazy"></div>`}
function show(step,shouldScroll=true){['mainPanel','ideasPanel','subPanel','topPanel','resultPanel'].forEach((x,i)=>$(x).classList.toggle('hidden',i>0&&(step===1||step===2&&i>2||step===3&&i===4)||step===4&&i!==4));if(step===2||step===3){$('ideasPanel').classList.remove('hidden');$('subPanel').classList.remove('hidden')}if(step===3)$('topPanel').classList.remove('hidden');if(step===4){$('mainPanel').classList.add('hidden');$('ideasPanel').classList.add('hidden');$('subPanel').classList.add('hidden');$('topPanel').classList.add('hidden')}for(let i=1;i<=4;i++)$('st'+i).classList.toggle('active',i===step);if(shouldScroll)(step===1?$('mainPanel'):step===2?$('ideasPanel'):step===3?$('topPanel'):$('resultPanel')).scrollIntoView({behavior:'smooth',block:'start'})}
function renderMains(){$('mains').innerHTML=mains.map(m=>`<button class="choice ${state.main===m?'selected':''}" data-main="${m}"><img class="mainphoto" src="${photos[photoMap[m]]}" alt="" loading="lazy"><span>${m}</span></button>`).join('');document.querySelectorAll('[data-main]').forEach(b=>b.onclick=()=>{state={main:b.dataset.main,subs:[],tops:[],recipe:null};renderMains();renderIdeas();renderSubs();show(2)})}
function renderIdeas(){$('ideasTitle').textContent=`${state.main}なら、こんなクレープが作れるよ！`;$('ideas').innerHTML=recipes[state.main].map((r,i)=>`<button class="recipe ${state.recipe===i?'active':''}" data-recipe="${i}">${art([state.main,...r[1].split(','),...r[2].split(',')])}<div class="body"><span class="tag">おすすめ ${i+1}</span><strong>${r[0]}クレープ</strong><p>${r[3]}</p><p><b>サブ：</b>${r[1].replaceAll(',', '・')}</p><p><b>トッピング：</b>${r[2].replaceAll(',', '・')}</p><span class="pill">この組み合わせを選ぶ</span></div></button>`).join('');document.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{let i=+b.dataset.recipe,r=recipes[state.main][i];state.recipe=i;state.subs=r[1].split(',');state.tops=r[2].split(',');renderIdeas();renderSubs();renderTops();show(3)})}
function renderSubs(){$('subs').innerHTML=subs.map(s=>`<button class="choice ${state.subs.includes(s)?'selected':''}" data-sub="${s}">${s}<small>${state.subs.includes(s)?'選択中':''}</small></button>`).join('');document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{let s=b.dataset.sub;state.subs=state.subs.includes(s)?state.subs.filter(x=>x!==s):[...state.subs,s];state.recipe=null;renderSubs();renderTops()})}
const profiles={'クリームチーズ':['まろやか・爽やか','酸味とコクで具材をまとめる。サーモンやえびと特に好相性。'],'たらこマヨ':['和風・うま味','魚介やたまごに塩気とコクをプラス。紫蘇やきゅうりで後味さっぱり。'],'ビンダルマヨ':['スパイシー・刺激的','チキンやビーフの力強い味を引き立てる。パクチーとも相性◎。'],'フレッシュサルサ':['さっぱり・メキシカン','タコスミートやチキンに酸味とフレッシュ感をプラス。'],'マッシュルームクリーム':['濃厚・洋食風','きのこやほうれん草、ベーコンをクリーミーにまとめる。'],'シュレッドチーズ':['コクうま・満足感','肉やソーセージにコクを足す。温かい具材と合わせるとよりおいしい。'],'ブリーチーズ':['リッチ・濃厚','サーモンやハムを贅沢な味わいに。少量でも存在感あり。']};
function score(t){let s=0;let all=recipes[state.main];all.forEach(r=>{if(r[2].split(',').includes(t))s+=3;if(r[1].split(',').some(x=>state.subs.includes(x))&&r[2].split(',').includes(t))s+=5});if(state.subs.includes('きのこマリネ')&&t==='マッシュルームクリーム')s+=7;if(state.subs.includes('紫蘇')&&t==='たらこマヨ')s+=7;if(state.subs.includes('パクチー')&&t==='ビンダルマヨ')s+=7;if(state.subs.includes('アボカド')&&t==='クリームチーズ')s+=3;return s}
function renderTops(){if(!state.main)return;let ranked=[...tops].sort((a,b)=>score(b)-score(a));$('topIntro').textContent=`「${state.main}」＋「${state.subs.join('・')||'サブなし'}」なら、こんな仕上がりがおすすめ！ トッピングを選ぶと下の完成イメージも変わるよ。`;$('topSuggestions').innerHTML=ranked.slice(0,3).map((t,i)=>`<button class="recipe ${state.tops.includes(t)?'active':''}" data-suggest="${t}">${art([state.main,...state.subs,t])}<div class="body"><span class="tag">${i===0?'いちばんおすすめ':i===1?'味変にもおすすめ':'もうひとつのアレンジ'}</span><strong>${t}仕立て</strong><p><b>${profiles[t][0]}</b></p><p>${profiles[t][1]}</p><p><b>完成の具材：</b>${[state.main,...state.subs,t].join(' ＋ ')}</p><span class="pill">${state.tops.includes(t)?'選択中・タップで解除':'この仕上がりにする'}</span></div></button>`).join('');document.querySelectorAll('[data-suggest]').forEach(b=>b.onclick=()=>{state.tops=[b.dataset.suggest];renderTops()});$('tops').innerHTML=tops.map(t=>`<button class="choice ${state.tops.includes(t)?'selected':''} ${ranked.slice(0,3).includes(t)?'recommended':''}" data-top="${t}">${t}<small>${profiles[t][0]}${state.tops.includes(t)?' ・ 選択中':''}</small></button>`).join('');document.querySelectorAll('[data-top]').forEach(b=>b.onclick=()=>{let t=b.dataset.top;state.tops=state.tops.includes(t)?state.tops.filter(x=>x!==t):[...state.tops,t];renderTops()})}
function finish(){let top=state.tops[0],match=recipes[state.main].find(r=>r[2].split(',').includes(top)&&r[1].split(',').some(x=>state.subs.includes(x)));$('resultName').textContent=match?match[0]+'クレープ':state.main+'のオリジナルクレープ';$('resultArt').innerHTML=art([state.main,...state.subs,...state.tops]);$('resultIngredients').innerHTML=`<p><b>メイン：</b>${state.main}</p><p><b>サブ：</b>${state.subs.join('・')||'なし'}</p><p><b>トッピング：</b>${state.tops.join('・')||'なし'}</p>`;$('resultDesc').textContent=top?profiles[top][0]+'。'+profiles[top][1]:'素材の味を楽しむシンプルなクレープ！';$('resultPanel').classList.remove('hidden');show(4)}
$('goTops').onclick=()=>{renderTops();show(3)};$('backSubs').onclick=()=>show(2);$('finish').onclick=finish;$('edit').onclick=()=>{renderTops();show(3)};$('reset').onclick=()=>{state={main:null,subs:[],tops:[],recipe:null};renderMains();show(1)};$('copy').onclick=async()=>{
  const str=`${$('resultName').textContent}\nメイン：${state.main}\nサブ：${state.subs.join('・')||'なし'}\nトッピング：${state.tops.join('・')||'なし'}`;
  const status=$('copyStatus');
  try{
    if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(str);
    status.textContent='コピーしたよ！ 🥞';
  }catch(error){
    window.prompt('この組み合わせをコピーしてね',str);
    status.textContent='組み合わせを表示したよ。コピーしてね。';
  }
};
renderMains();show(1,false);
