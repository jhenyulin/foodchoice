// Food Picker PWA - 簡潔 iOS-like 版本（移除匯出與清除）
// 功能：新增 / 刪除 / 隨機挑選（結果有 confetti 動畫）
// 儲存在 localStorage，並註冊 service worker（HTTPS 環境）

const input = document.getElementById('foodInput');
const addBtn = document.getElementById('addBtn');
const listEl = document.getElementById('foodList');
const pickBtn = document.getElementById('pickBtn');
const toast = document.getElementById('toast');

const STORAGE_KEY = 'cute_foods_v2';

let foods = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [
];

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}

function showToast(text, timeout=1300){
  toast.textContent = text;
  toast.classList.remove('hidden');
  setTimeout(()=>toast.classList.add('hidden'), timeout);
}

function render(){
  listEl.innerHTML = '';
  if (foods.length === 0) {
    const li = document.createElement('li');
    li.innerHTML = '<span class="food-name" style="color:#9aa3b2">清單目前為空，輸入一個吧～</span>';
    listEl.appendChild(li);
    return;
  }

  foods.forEach((f, i) => {
    const li = document.createElement('li');
    li.classList.add('enter');

    const name = document.createElement('div');
    name.className = 'food-name';
    name.textContent = f;

    const actions = document.createElement('div');

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '移除';
    del.onclick = () => {
      foods.splice(i,1);
      save();
      render();
      showToast('已移除');
    };

    actions.appendChild(del);
    li.appendChild(name);
    li.appendChild(actions);
    listEl.appendChild(li);
  });
}

// Add behavior
addBtn.addEventListener('click', () => {
  const v = input.value.trim();
  if (!v) return;
  if (foods.includes(v)){
    input.value = '';
    showToast('已在清單中～');
    return;
  }
  foods.unshift(v);
  input.value = '';
  save();
  render();
  showToast('已新增！');
  input.focus();
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter'){
    addBtn.click();
  }
});

// Pick behavior with confetti
pickBtn.addEventListener('click', () => {
  if (foods.length === 0){
    alert('清單為空，請先新增一些食物😋');
    return;
  }
  const choice = foods[Math.floor(Math.random()*foods.length)];
  showPickedModal(choice);
  spawnConfetti();
});

function showPickedModal(choice){
  const picked = document.createElement('div');
  picked.style.position = 'fixed';
  picked.style.left = '50%';
  picked.style.top = '50%';
  picked.style.transform = 'translate(-50%,-50%)';
  picked.style.background = 'white';
  picked.style.borderRadius = '80px';
  picked.style.padding = '150px 220px';
  picked.style.boxShadow = '0 22px 60px rgba(15,23,42,0.18)';
  picked.style.textAlign = 'center';
  picked.style.zIndex = 9998;
  picked.innerHTML = `
    <div style="font-size:14px;color:#9aa3b2">今天就吃</div>
    <div style="font-size:40px;font-weight:700;margin:10px 0">${choice}</div>
    <div style="margin-top:8px">
      <button id="okClose" style="padding:10px 18px;border-radius:12px;border:none;background:${getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#0A84FF'};color:white;font-weight:700">喔耶</button>
    </div>`;
  document.body.appendChild(picked);
  document.getElementById('okClose').onclick = () => {
    picked.remove();
  };
}

// Confetti generator (emoji confetti)
function spawnConfetti() {
  const emojis = ["🎉","✨","💫","🍣","🍜","🍔","🥗","🍰"];
  const count = 18;
  for (let i=0;i<count;i++){
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    c.style.left = (10 + Math.random()*80) + 'vw';
    c.style.top = '-10vh';
    c.style.fontSize = (14 + Math.random()*18) + 'px';
    c.style.opacity = (0.9 - Math.random()*0.4);
    c.style.transform = `rotate(${Math.random()*360}deg)`;
    const delay = Math.random()*260;
    c.style.animationDelay = `${delay}ms`;
    document.body.appendChild(c);
    // remove after animation
    setTimeout(()=> {
      c.remove();
    }, 2200 + delay);
  }
}

render();

// register service worker (HTTPS only)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(()=>{ /* ignore registration errors locally */});
}