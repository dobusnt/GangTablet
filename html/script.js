(() => {
  /* ---------- utilities ---------- */
  const parent = typeof GetParentResourceName === 'function'
               ? GetParentResourceName()
               : 'gang_tablet';

  async function nuiPost(endpoint, data = {}) {
    try {
      const res = await fetch(`https://${parent}/${endpoint}`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify(data)
      });
      const text = await res.text();
      if (!text) return null; 
      try   { return JSON.parse(text); }
      catch { return text; }  
    } catch (err) {
      console.error('[GangTablet] NUI fetch failed', err);
      return null;
    }
  }

  /* ---------- cache DOM ---------- */
  const tabletUI = document.getElementById('tablet-ui');
  const closeBtn = document.getElementById('close-btn');
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPages = document.querySelectorAll('.tab-content');
  const jobsList = document.getElementById('jobs-list');
  const rewardsList = document.getElementById('rewards-list');

  const sidebarBtns = document.querySelectorAll('.icon-btn');
  const panes = {
    jobs     : document.getElementById('jobs-screen'),
    apps     : document.getElementById('apps-screen'),
    settings : document.getElementById('settings-screen')
  };

  const bgRadios = document.querySelectorAll('input[name="bg"]');
  const screen   = document.querySelector('.screen');

  /* ---------- helpers ---------- */
  function toggleUI(show){
    tabletUI.classList.toggle('hidden', !show);
    if (show){
      switchSidebar('jobs');
      loadJobs();
    }
  }
  function switchTab(btn){
    tabBtns.forEach(b=>b.classList.remove('active'));
    tabPages.forEach(p=>p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.remove('hidden');
  }
  function switchSidebar(target){
    sidebarBtns.forEach(b=>b.classList.toggle('active', b.dataset.screen===target));
    Object.entries(panes).forEach(([k,el])=>el.classList.toggle('hidden', k!==target));
    if (target==='jobs') loadJobs();
  }

  /* ---------- job list ---------- */
  async function loadJobs(){
    const jobs = await nuiPost('getActiveJobs') || {};
    jobsList.innerHTML = '';
    Object.entries(jobs).forEach(([id, job])=>{
      if (!job.label) return;  
      const li = document.createElement('li');
      li.className = 'job-item';
      li.innerHTML = `
        <span class="job-name">${job.label} <span class="pay">$${job.reward}</span></span>
        <button class="accept-btn" data-id="${id}">Accept</button>`;
      jobsList.appendChild(li);
    });
  }
  jobsList.addEventListener('click', e=>{
    if (e.target.classList.contains('accept-btn')){
      const jobId = e.target.dataset.id;
      e.target.disabled = true;
      nuiPost('acceptJobFromTablet',{jobId});
    }
  });

  /* ---------- wires ---------- */
  tabBtns.forEach(btn=>btn.addEventListener('click',()=>switchTab(btn)));
  sidebarBtns.forEach(btn=>btn.addEventListener('click',()=>switchSidebar(btn.dataset.screen)));
  closeBtn.addEventListener('click',()=>nuiPost('close'));

  /* theme radio */
  const savedTheme=localStorage.getItem('gangTabletTheme');
  if(savedTheme){screen.dataset.bg=savedTheme;document.querySelector(`input[value="${savedTheme}"]`).checked=true;}
  bgRadios.forEach(r=>r.addEventListener('change',()=>{screen.dataset.bg=r.value;localStorage.setItem('gangTabletTheme',r.value);}))

  /* NUI messages */
  window.addEventListener('message', e=>{
    const d = e.data;
    if (d.action==='toggleUI') toggleUI(d.show);

    if (d.action==='addReward'){
      const li=document.createElement('li');
      li.className='reward-row';
      li.textContent=`$${d.cash} – click to claim`;
      li.onclick=()=>{nuiPost('claimReward',{amount:d.cash});li.remove();};
      rewardsList.appendChild(li);
    }

    if (d.action === 'removeJob'){
      const li = jobsList.querySelector(`button[data-id="${d.jobId}"]`)?.parentElement;
      if (li) li.remove();
  }

  });

  /* ESC */
  document.addEventListener('keydown',e=>{if(e.key==='Escape')nuiPost('close');});
})();
