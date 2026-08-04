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
    { title: 'Judul Lagu 1', artist: 'Nama Artis 1', src: 'assets/track1.mp3', colors: ['#4de8ff', '#b46bff'] },
    { title: 'Judul Lagu 2', artist: 'Nama Artis 2', src: 'assets/track2.mp3', colors: ['#b46bff', '#4dffb0'] },
    { title: 'Judul Lagu 3', artist: 'Nama Artis 3', src: 'assets/track3.mp3', colors: ['#4dffb0', '#4de8ff'] },
    { title: 'Judul Lagu 4', artist: 'Nama Artis 4', src: 'assets/track4.mp3', colors: ['#ff9d4d', '#b46bff'] },
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
    // Placeholder artwork berbentuk cincin gradient dengan inisial lagu.
    // Ganti isi <svg> ini dengan <img src="..."> bila punya foto sampul asli.
    const [c1, c2] = track.colors;
    els.coverSvg.innerHTML = `
      <defs>
        <linearGradient id="g-${current}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#0e1524"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke="url(#g-${current})" stroke-width="2"/>
      <circle cx="100" cy="100" r="6" fill="url(#g-${current})"/>
      <text x="100" y="108" text-anchor="middle" font-family="Rajdhani, sans-serif"
            font-size="30" font-weight="700" fill="${c1}" opacity="0.85">
        ${track.title.trim().charAt(0).toUpperCase()}
      </text>
    `;
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
          <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" fill="#0e1524"/>
            <circle cx="24" cy="24" r="14" fill="none" stroke="${t.colors[0]}" stroke-width="1.5"/>
            <circle cx="24" cy="24" r="2.5" fill="${t.colors[1]}"/>
          </svg>
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
