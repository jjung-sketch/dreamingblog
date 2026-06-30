(function () {
  if (window.location.pathname.includes('admin.html')) return;

  // ── 스타일 주입 ──────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #adm-float { position:fixed; bottom:24px; right:20px; z-index:9000; display:flex; flex-direction:column; align-items:flex-end; gap:7px; }
    #adm-toggle { background:#1a1a2e; border:1.5px solid #444; color:#888; border-radius:50px; padding:8px 15px; font-size:0.78rem; cursor:pointer; transition:all .2s; }
    #adm-toggle:hover { border-color:#f4c842; color:#f4c842; }
    #adm-actions { display:none; flex-direction:column; gap:6px; align-items:flex-end; }
    #adm-float.open #adm-actions { display:flex; }
    .adm-btn { padding:9px 18px; border-radius:50px; font-size:0.82rem; font-weight:700; cursor:pointer; border:none; transition:all .15s; white-space:nowrap; }
    .adm-btn:hover { transform:scale(1.04); }
    .adm-edit { background:#f4c842; color:#0d0d1a; }
    .adm-del  { background:#e63946; color:#fff; }
    #adm-overlay { position:fixed; inset:0; background:rgba(0,0,0,.72); z-index:10000; display:flex; align-items:center; justify-content:center; }
    #adm-box { background:#1a1a2e; border-radius:20px; padding:32px 28px; width:300px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,.5); }
    #adm-box h3 { color:#f4c842; margin:0 0 18px; font-size:1.1rem; }
    #adm-pw { width:100%; padding:12px; border-radius:10px; border:1.5px solid #2a2a4a; background:#0d0d1a; color:#fff; font-size:1.1rem; text-align:center; outline:none; margin-bottom:12px; box-sizing:border-box; letter-spacing:4px; }
    #adm-pw:focus { border-color:#f4c842; }
    #adm-pw.shake { animation:admShake .3s; border-color:#e63946; }
    @keyframes admShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
    #adm-ok { width:100%; padding:12px; border-radius:50px; background:#f4c842; color:#0d0d1a; font-weight:700; border:none; cursor:pointer; font-size:0.95rem; }
    #adm-cancel { background:none; border:none; color:#666; cursor:pointer; margin-top:10px; font-size:0.82rem; display:block; width:100%; }
  `;
  document.head.appendChild(style);

  // ── 플로팅 버튼 ──────────────────────────────────────────
  const float = document.createElement('div');
  float.id = 'adm-float';
  float.innerHTML = `
    <div id="adm-actions">
      <button class="adm-btn adm-edit" id="adm-edit-btn">✏️ 수정</button>
      <button class="adm-btn adm-del"  id="adm-del-btn">🗑️ 삭제</button>
    </div>
    <button id="adm-toggle">⚙️ 관리자</button>
  `;
  document.body.appendChild(float);

  // ── 비밀번호 모달 ────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'adm-overlay';
  overlay.style.display = 'none';
  overlay.innerHTML = `
    <div id="adm-box">
      <h3>🔐 관리자 확인</h3>
      <input type="password" id="adm-pw" placeholder="비밀번호" maxlength="20">
      <button id="adm-ok">확인</button>
      <button id="adm-cancel">취소</button>
    </div>
  `;
  document.body.appendChild(overlay);

  let pendingFn = null;

  function closeModal() {
    overlay.style.display = 'none';
    document.getElementById('adm-pw').value = '';
    pendingFn = null;
  }

  function requireAuth(fn) {
    if (sessionStorage.getItem('adm_auth') === '1') { fn(); return; }
    pendingFn = fn;
    overlay.style.display = 'flex';
    setTimeout(() => document.getElementById('adm-pw').focus(), 80);
  }

  document.getElementById('adm-ok').onclick = function () {
    const pw = document.getElementById('adm-pw');
    if (pw.value === '123') {
      sessionStorage.setItem('adm_auth', '1');
      closeModal();
      if (pendingFn) pendingFn();
    } else {
      pw.classList.add('shake');
      setTimeout(() => pw.classList.remove('shake'), 400);
      pw.value = '';
    }
  };
  document.getElementById('adm-pw').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('adm-ok').click();
  });
  document.getElementById('adm-cancel').onclick = closeModal;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  // ── 버튼 동작 ────────────────────────────────────────────
  document.getElementById('adm-toggle').onclick = () =>
    document.getElementById('adm-float').classList.toggle('open');

  function currentFile() {
    const p = window.location.pathname;
    const m = p.match(/blog\/([^/]+\.html)/);
    return m ? 'blog/' + m[1] : null;
  }

  document.getElementById('adm-edit-btn').onclick = () =>
    requireAuth(() => {
      const f = currentFile();
      if (f) window.location.href = '../admin.html?mode=edit&file=' + encodeURIComponent(f);
    });

  document.getElementById('adm-del-btn').onclick = () =>
    requireAuth(() => {
      const f = currentFile();
      if (f) window.location.href = '../admin.html?mode=delete&file=' + encodeURIComponent(f);
    });
})();
