/* ============================================================
   AMBIENT PARTICLES (dipakai di kedua halaman)
   ============================================================ */
(function initParticles(){
  const wrap = document.getElementById('particles');
  if(!wrap) return;
  const count = window.innerWidth < 760 ? 14 : 26;
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    const left = Math.random()*100;
    const delay = Math.random()*14;
    const dur = 10 + Math.random()*10;
    p.style.left = left + 'vw';
    p.style.bottom = (-10 - Math.random()*20) + 'px';
    p.style.animationDuration = dur + 's';
    p.style.animationDelay = delay + 's';
    wrap.appendChild(p);
  }
})();

/* ============================================================
   MUSIC PLAYER (hanya berjalan di music.html)
   ============================================================ */
(function initPlayer(){
  const audio = document.getElementById('audio');
  if(!audio) return;

  // GANTI daftar ini dengan lagu favoritmu sendiri.
  // src: path ke file audio (mp3/ogg/wav)
  // cover: dua warna gradient untuk artwork placeholder — ganti jadi
  //        <img src="assets/cover-kamu.jpg"> di renderCover() bila punya foto asli.
  const tracks = [
    { title: 'Champagne Supernova', artist: 'oasis', src: 'assets/lagu1.mp3', cover: 'assets/cover1.jpg', colors: ['#4de8ff', '#b46bff'] },
    { title: 'Sesi Potret', artist: 'eńau,Ari Lesmana', src: 'assets/lagu2.mp3', cover: 'assets/cover2.jpg', colors: ['#b46bff', '#4dffb0'] },
    { title: 'Tarot', artist: '.feast', src: 'assets/lagu3.mp3', cover: 'assets/cover3.jpg', colors: ['#4dffb0', '#4de8ff'] },
    { title: 'Timeless', artist: 'The Weeknd,Playboi Carti', src: 'assets/lagu4.mp3', cover: 'assets/cover4.jpg', colors: ['#ff9d4d', '#b46bff'] },
  ];

  let current = 0;
  let isPlaying = false;

  const els = {
    region: document.getElementById('playerRegion'),
    coverBox: document.getElementById('coverBox'),
    coverSvg: document.getElementById('coverSvg'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('trackArtist'),
    playBtn: document.getElementById('playBtn'),
    playIcon: document.getElementById('playIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    progressTrack: document.getElementById('progressTrack'),
    progressFill: document.getElementById('progressFill'),
    timeCurrent: document.getElementById('timeCurrent'),
    timeDuration: document.getElementById('timeDuration'),
    waveform: document.getElementById('waveform'),
    playlist: document.getElementById('playlist'),
  };

  const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
  const ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';

  function fmtTime(sec){
    if(!isFinite(sec)) return '0:00';
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  function renderCover(track){
  els.coverBox.querySelector('#coverSvg')?.remove();
  let img = els.coverBox.querySelector('.cover-img');
  if(!img){
    img = document.createElement('img');
    img.className = 'cover-img';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:relative;z-index:1;';
    els.coverBox.appendChild(img);
  }
  img.src = track.cover;
}

  function buildWaveform(){
    els.waveform.innerHTML = '';
    const bars = window.innerWidth < 500 ? 28 : 44;
    for(let i=0;i<bars;i++){
      const s = document.createElement('span');
      s.style.animationDelay = (-(Math.random()*1.1)).toFixed(2) + 's';
      els.waveform.appendChild(s);
    }
  }

  function buildPlaylist(){
    els.playlist.innerHTML = '';
    tracks.forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 'track-row' + (i === current ? ' active' : '');
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.dataset.index = i;
      row.innerHTML = `
        <span class="track-idx">${String(i+1).padStart(2,'0')}</span>
        <div class="track-thumb">
          <img src="${t.cover}" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div>
          <div class="track-info-title">${t.title}</div>
          <div class="track-info-artist">${t.artist}</div>
        </div>
        <div class="track-dur">
          <div class="eq"><span></span><span></span><span></span></div>
          <span class="dur-label">--:--</span>
        </div>
      `;
      row.addEventListener('click', () => loadTrack(i, true));
      row.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); loadTrack(i, true); }
      });
      els.playlist.appendChild(row);
    });
  }

  function updateActiveRow(){
    [...els.playlist.children].forEach((row, i) => {
      row.classList.toggle('active', i === current);
    });
  }

  function loadTrack(index, autoplay){
    current = (index + tracks.length) % tracks.length;
    const t = tracks[current];
    audio.src = t.src;
    els.title.textContent = t.title;
    els.artist.textContent = t.artist;
    renderCover(t);
    updateActiveRow();
    els.progressFill.style.width = '0%';
    els.timeCurrent.textContent = '0:00';
    if(autoplay){
      play();
    } else {
      pause();
    }
  }

  function play(){
    audio.play().catch(()=>{ /* butuh interaksi pengguna dulu — normal di browser */ });
    isPlaying = true;
    els.playIcon.innerHTML = ICON_PAUSE;
    els.region.classList.add('is-playing');
    els.coverBox.classList.add('is-playing');
  }

  function pause(){
    audio.pause();
    isPlaying = false;
    els.playIcon.innerHTML = ICON_PLAY;
    els.region.classList.remove('is-playing');
    els.coverBox.classList.remove('is-playing');
  }

  function togglePlay(){ isPlaying ? pause() : play(); }

  function next(){ loadTrack(current + 1, true); }
  function prev(){
    // jika sudah lewat 3 detik, ulang lagu ini dulu (perilaku pemutar musik standar)
    if(audio.currentTime > 3){ audio.currentTime = 0; return; }
    loadTrack(current - 1, true);
  }

  function seekFromEvent(e){
    const rect = els.progressTrack.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    if(isFinite(audio.duration)){
      audio.currentTime = ratio * audio.duration;
    }
  }

  // ---- events ----
  els.playBtn.addEventListener('click', togglePlay);
  els.nextBtn.addEventListener('click', next);
  els.prevBtn.addEventListener('click', prev);

  els.progressTrack.addEventListener('click', seekFromEvent);
  els.progressTrack.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight'){ audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); }
    if(e.key === 'ArrowLeft'){ audio.currentTime = Math.max(0, audio.currentTime - 5); }
  });

  audio.addEventListener('timeupdate', () => {
    if(isFinite(audio.duration) && audio.duration > 0){
      els.progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
    els.timeCurrent.textContent = fmtTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    els.timeDuration.textContent = fmtTime(audio.duration);
    const row = els.playlist.children[current];
    if(row) row.querySelector('.dur-label').textContent = fmtTime(audio.duration);
  });

  audio.addEventListener('ended', next);

  // isi durasi tiap baris playlist di awal (tanpa memutar)
  function primeDurations(){
    tracks.forEach((t, i) => {
      const probe = new Audio();
      probe.preload = 'metadata';
      probe.src = t.src;
      probe.addEventListener('loadedmetadata', () => {
        const row = els.playlist.children[i];
        if(row) row.querySelector('.dur-label').textContent = fmtTime(probe.duration);
      });
    });
  }

  // ---- init ----
  buildWaveform();
  buildPlaylist();
  loadTrack(0, false);
  primeDurations();
})();
