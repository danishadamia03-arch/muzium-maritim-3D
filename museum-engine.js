(function () {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x091a33);
  scene.fog = new THREE.FogExp2(0x091a33, 0.0018);

  const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 280);
  camera.position.set(0, 2.35, 11.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);

  // Pencahayaan Seimbang Supaya Warna Navy, Marble Biru-Kelabu & Siling Beige Tidak Pudar Putih
  scene.add(new THREE.AmbientLight(0xfff5e4, 0.52));
  const hemiLight = new THREE.HemisphereLight(0xebd8b7, 0x1b3354, 0.42);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xfff0d4, 0.35);
  dirLight.position.set(15, 28, 20);
  scene.add(dirLight);

  // Tekstur Mozek Marble Biru Gelap & Kelabu untuk Lantai
  function createDarkBlueGreyMarbleTexture() {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#5d6b7c";
    ctx.fillRect(0, 0, 512, 512);

    const tiles = [
      { x: 0, y: 0, bg: "#1a3354", vein1: "rgba(155, 175, 198, 0.34)", vein2: "rgba(10, 22, 40, 0.45)" },
      { x: 256, y: 0, bg: "#768494", vein1: "rgba(28, 52, 84, 0.36)", vein2: "rgba(215, 224, 235, 0.28)" },
      { x: 0, y: 256, bg: "#6c7b8c", vein1: "rgba(22, 43, 72, 0.38)", vein2: "rgba(205, 216, 228, 0.26)" },
      { x: 256, y: 256, bg: "#152a47", vein1: "rgba(145, 168, 194, 0.32)", vein2: "rgba(8, 18, 34, 0.5)" }
    ];

    tiles.forEach((t) => {
      ctx.fillStyle = t.bg;
      ctx.fillRect(t.x + 3, t.y + 3, 250, 250);

      ctx.strokeStyle = t.vein1;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(t.x + 14, t.y + 38);
      ctx.bezierCurveTo(t.x + 85, t.y + 92, t.x + 155, t.y + 148, t.x + 240, t.y + 215);
      ctx.stroke();

      ctx.strokeStyle = t.vein2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(t.x + 225, t.y + 24);
      ctx.bezierCurveTo(t.x + 145, t.y + 105, t.x + 95, t.y + 155, t.x + 24, t.y + 232);
      ctx.stroke();
    });

    ctx.strokeStyle = "#2c3a4b";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 512, 512);
    ctx.beginPath();
    ctx.moveTo(256, 0); ctx.lineTo(256, 512);
    ctx.moveTo(0, 256); ctx.lineTo(512, 256);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(65, 65);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  // Palet Warna: Dinding Navy Blue + Lantai Marble Biru Gelap & Kelabu + Siling Beige
  const matNavyWall = new THREE.MeshStandardMaterial({ color: 0x0b2242, roughness: 0.68, metalness: 0.08 });
  const matTerracotta = new THREE.MeshStandardMaterial({ color: 0xd96b27, roughness: 0.55, metalness: 0.14 });
  const matEmerald = new THREE.MeshStandardMaterial({ color: 0x166953, roughness: 0.52, metalness: 0.14 });
  const matTurquoise = new THREE.MeshStandardMaterial({ color: 0x1b7f8c, roughness: 0.50, metalness: 0.16 });
  const matGold = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.34, metalness: 0.72 });
  const matBronze = new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.38, metalness: 0.75 });
  const matFloorMarble = new THREE.MeshStandardMaterial({
    map: createDarkBlueGreyMarbleTexture(),
    roughness: 0.38,
    metalness: 0.14
  });
  const matCeilingBeige = new THREE.MeshStandardMaterial({ color: 0xd8c7a8, roughness: 0.85, metalness: 0.02 });
  const matRubyCarpet = new THREE.MeshStandardMaterial({ color: 0x9e1b24, roughness: 0.82 });
  const matPorcelain = new THREE.MeshStandardMaterial({ color: 0xeef4fa, roughness: 0.25, metalness: 0.1 });
  const matCobalt = new THREE.MeshStandardMaterial({ color: 0x1a4b8c, roughness: 0.28, metalness: 0.15 });
  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.05
  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(280, 280), matFloorMarble);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -22);
  scene.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(280, 280), matCeilingBeige);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 7.8, -22);
  scene.add(ceiling);

  const colliders = [];
  function addWall(x, y, z, w, h, d, wallMat = matNavyWall, trimMat = matTerracotta, addCollider = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    const dado = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.55, d + 0.06), trimMat);
    dado.position.set(x, 0.275, z);
    scene.add(dado);

    const crown = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.24, d + 0.08), matGold);
    crown.position.set(x, h - 0.12, z);
    scene.add(crown);

    if (addCollider) {
      colliders.push({
        minX: x - w / 2 - 0.55,
        maxX: x + w / 2 + 0.55,
        minZ: z - d / 2 - 0.55,
        maxZ: z + d / 2 + 0.55
      });
    }
    return mesh;
  }

  function addCarpet(x, z, w, d) {
    const border = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.35, d + 0.35), matGold);
    border.rotation.x = -Math.PI / 2;
    border.position.set(x, 0.012, z);
    scene.add(border);

    const c = new THREE.Mesh(new THREE.PlaneGeometry(w, d), matRubyCarpet);
    c.rotation.x = -Math.PI / 2;
    c.position.set(x, 0.016, z);
    scene.add(c);
  }

  function addChandelier(x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 12), matGold);
    rod.position.y = 0.9;
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.06, 12, 32), matGold);
    r1.rotation.x = Math.PI / 2;
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 12, 24), matTerracotta);
    r2.rotation.x = Math.PI / 2;
    r2.position.y = 0.42;
    g.add(rod, r1, r2);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfff1c2 }));
      orb.position.set(Math.cos(a) * 1.4, 0.12, Math.sin(a) * 1.4);
      g.add(orb);
    }
    scene.add(g);
    const cLight = new THREE.PointLight(0xffe8b3, 0.65, 30);
    cLight.position.set(x, y - 0.3, z);
    scene.add(cLight);
  }

  function addArtifactVase(x, z, style = "ming") {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.95), matTerracotta);
    ped.position.y = 0.525;
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.1, 1.04), matGold);
    topTrim.position.y = 1.08;

    const bodyMat = style === "ming" ? matPorcelain : matBronze;
    const bandMat = style === "ming" ? matCobalt : matGold;

    const baseVase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.25, 20), bodyMat);
    baseVase.position.y = 1.25;
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), bodyMat);
    belly.scale.set(1, 1.25, 1);
    belly.position.y = 1.62;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.03, 10, 24), bandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 1.62;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.35, 20), bodyMat);
    neck.position.y = 2.08;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 10, 20), bandMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = 2.25;

    g.add(ped, topTrim, baseVase, belly, band, neck, lip);
    scene.add(g);
    colliders.push({ minX: x - 0.72, maxX: x + 0.72, minZ: z - 0.72, maxZ: z + 0.72 });
  }

  function addMaritimeMonument(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.4, 0.9, 24), matTerracotta);
    base.position.y = 0.45;
    const goldRing = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.12, 24), matGold);
    goldRing.position.y = 0.92;
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.65, 24, 24), matTurquoise);
    globe.position.y = 1.75;
    const meridian = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.045, 12, 32), matGold);
    meridian.position.y = 1.75;
    const equator = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.04, 12, 32), matGold);
    equator.rotation.x = Math.PI / 2;
    equator.position.y = 1.75;
    g.add(base, goldRing, globe, meridian, equator);
    scene.add(g);
    colliders.push({ minX: x - 1.5, maxX: x + 1.5, minZ: z - 1.5, maxZ: z + 1.5 });
  }

  function addGlassVitrine(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.1), matTerracotta);
    ped.position.y = 0.5;
    const rim = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 1.18), matGold);
    rim.position.y = 1.02;
    const glassBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.85, 1.0), matGlass);
    glassBox.position.y = 1.48;
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.85, 16), matGold);
    scroll.rotation.z = Math.PI / 2;
    scroll.rotation.y = 0.3;
    scroll.position.y = 1.24;
    g.add(ped, rim, glassBox, scroll);
    scene.add(g);
    colliders.push({ minX: x - 1.0, maxX: x + 1.0, minZ: z - 0.8, maxZ: z + 0.8 });
  }

  function wrapLines(ctx, text, maxWidth) {
    const rawLines = text.split("\n");
    const result = [];
    for (const raw of rawLines) {
      if (raw.trim() === "") { result.push(""); continue; }
      const words = raw.split(" ");
      let current = "";
      for (const word of words) {
        const test = current ? current + " " + word : word;
        if (ctx.measureText(test).width > maxWidth && current) {
          result.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) result.push(current);
    }
    return result;
  }

  function createTextPanel({
    stepBadge = "", title, body, width = 7.4, height = 4.1,
    canvasW = 2200, canvasH = 1220, titleSize = 40, bodySize = 30,
    headerColor = "#d96b27", frameMat = matGold
  }) {
    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(0, 0, canvasW, canvasH);

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 14;
    ctx.strokeRect(14, 14, canvasW - 28, canvasH - 28);
    ctx.strokeStyle = headerColor;
    ctx.lineWidth = 5;
    ctx.strokeRect(30, 30, canvasW - 60, canvasH - 60);

    const padX = 76;
    let cursorY = 78;

    if (stepBadge) {
      ctx.fillStyle = headerColor;
      ctx.fillRect(34, 34, canvasW - 68, 66);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(stepBadge, padX, 78);
      cursorY = 152;
    }

    ctx.fillStyle = "#0b2242";
    ctx.font = `bold ${titleSize}px 'Segoe UI', Arial, sans-serif`;
    for (const line of wrapLines(ctx, title, canvasW - padX * 2)) {
      ctx.fillText(line, padX, cursorY);
      cursorY += titleSize * 1.22;
    }

    cursorY += 8;
    ctx.strokeStyle = headerColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(padX, cursorY);
    ctx.lineTo(canvasW - padX, cursorY);
    ctx.stroke();
    cursorY += 42;

    if (body) {
      ctx.fillStyle = "#1f2933";
      ctx.font = `${bodySize}px 'Segoe UI', Arial, sans-serif`;
      const lineH = bodySize * 1.32;
      for (const line of wrapLines(ctx, body, canvasW - padX * 2)) {
        if (line === "") { cursorY += lineH * 0.42; }
        else { ctx.fillText(line, padX, cursorY); cursorY += lineH; }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, height + 0.14, 0.12), frameMat);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    board.position.z = 0.065;
    g.add(frame, board);
    return g;
  }

  function createRoadSign({ text, subtext = "", width = 4.6, height = 2.4, bgColor = "#166953" }) {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 760;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1600, 760);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 18;
    ctx.strokeRect(22, 22, 1556, 716);
    ctx.strokeStyle = "#f5d673";
    ctx.lineWidth = 8;
    ctx.strokeRect(46, 46, 1508, 668);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 46px 'Segoe UI', Arial, sans-serif";
    const lines = wrapLines(ctx, text, 1260);
    const totalTextH = lines.length * 60 + (subtext ? 75 : 0);
    let y = (760 - totalTextH) / 2 + 42;

    lines.forEach(l => {
      ctx.fillText(l, 800, y);
      y += 60;
    });

    if (subtext) {
      ctx.fillStyle = "#ffe58f";
      ctx.font = "bold 30px 'Segoe UI', Arial, sans-serif";
      const subLines = wrapLines(ctx, subtext, 1280);
      y += 14;
      subLines.forEach(sl => {
        ctx.fillText(sl, 800, y);
        y += 42;
      });
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, height + 0.14, 0.12), matGold);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    board.position.z = 0.065;
    g.add(frame, board);
    return g;
  }

  function createTablePanel({
    stepBadge = "", title, headers, rows, colRatios, width = 8.2, height = 4.2,
    canvasW = 2400, canvasH = 1200, fontSize = 26, headerColor = "#166953", colHeaderColors = null
  }) {
    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 14;
    ctx.strokeRect(14, 14, canvasW - 28, canvasH - 28);

    const padX = 64;
    let cursorY = 74;

    if (stepBadge) {
      ctx.fillStyle = headerColor;
      ctx.fillRect(34, 34, canvasW - 68, 62);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(stepBadge, padX, 76);
      cursorY = 144;
    }

    ctx.fillStyle = "#0b2242";
    ctx.font = "bold 36px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(title, padX, cursorY);
    cursorY += 34;

    const tableW = canvasW - padX * 2;
    const colWidths = colRatios.map(r => r * tableW);
    const headerH = 74;

    let cx = padX;
    headers.forEach((h, idx) => {
      ctx.fillStyle = (colHeaderColors && colHeaderColors[idx]) ? colHeaderColors[idx] : headerColor;
      ctx.fillRect(cx, cursorY, colWidths[idx], headerH);
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 3;
      ctx.strokeRect(cx, cursorY, colWidths[idx], headerH);

      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${fontSize + 1}px 'Segoe UI', Arial, sans-serif`;
      const hLines = wrapLines(ctx, h, colWidths[idx] - 28);
      let hy = cursorY + (hLines.length > 1 ? 32 : 46);
      hLines.forEach(hl => { ctx.fillText(hl, cx + 14, hy); hy += fontSize * 1.15; });
      cx += colWidths[idx];
    });
    cursorY += headerH;

    const lineH = fontSize * 1.28;
    rows.forEach((row, rIdx) => {
      const wrapped = row.map((cell, cIdx) => wrapLines(ctx, cell, colWidths[cIdx] - 30));
      const maxLines = Math.max(...wrapped.map(l => l.length));
      const rowH = Math.max(66, maxLines * lineH + 26);

      ctx.fillStyle = rIdx % 2 === 0 ? "#f7eedc" : "#fffdf9";
      ctx.fillRect(padX, cursorY, tableW, rowH);
      ctx.strokeStyle = "#c9b38c";
      ctx.lineWidth = 2;
      ctx.strokeRect(padX, cursorY, tableW, rowH);

      let cellX = padX;
      wrapped.forEach((lines, cIdx) => {
        if (cIdx > 0) {
          ctx.beginPath(); ctx.moveTo(cellX, cursorY); ctx.lineTo(cellX, cursorY + rowH); ctx.stroke();
        }
        ctx.fillStyle = cIdx === 0 ? "#b84e14" : "#1f2933";
        ctx.font = cIdx === 0 ? `bold ${fontSize}px 'Segoe UI', Arial, sans-serif` : `${fontSize}px 'Segoe UI', Arial, sans-serif`;
        let ty = cursorY + 34;
        lines.forEach(l => { ctx.fillText(l, cellX + 15, ty); ty += lineH; });
        cellX += colWidths[cIdx];
      });
      cursorY += rowH;
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, height + 0.14, 0.12), matGold);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    board.position.z = 0.065;
    g.add(frame, board);
    return g;
  }

  function createMapFrame(imageUrl, fallbackCandidates, labelTitle, width = 5.6, height = 3.9) {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, height + 0.2, 0.14), matTerracotta);
    const innerGold = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.15), matGold);

    const placeholder = createTextPanel({
      stepBadge: "PETA SEJARAH",
      title: labelTitle,
      body: `Gambar rujukan: ${imageUrl || fallbackCandidates[0]}\n(Pastikan fail gambar berada di dalam folder Muzium-Maritim-3D)`,
      width, height, canvasW: 1800, canvasH: 1100, titleSize: 38, bodySize: 28
    });
    placeholder.position.z = 0.08;

    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
    board.position.z = 0.095;
    board.visible = false;

    g.add(frame, innerGold, placeholder, board);

    const candidates = [];
    if (imageUrl) {
      candidates.push(imageUrl);
      candidates.push(encodeURI(imageUrl));
    }
    if (Array.isArray(fallbackCandidates)) {
      fallbackCandidates.forEach((fc) => {
        candidates.push(fc);
        candidates.push(encodeURI(fc));
      });
    }

    const loader = new THREE.TextureLoader();
    function tryLoad(idx) {
      if (idx >= candidates.length) return;
      loader.load(
        candidates[idx],
        (tex) => {
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          mat.map = tex;
          mat.needsUpdate = true;
          board.visible = true;
          placeholder.visible = false;
        },
        undefined,
        () => tryLoad(idx + 1)
      );
    }
    tryLoad(0);
    return g;
  }

  function placePanel(panel, x, y, z, rotY = 0) {
    panel.position.set(x, y, z);
    panel.rotation.y = rotY;
    scene.add(panel);
  }

  // =========================================================================
  // ZON 1: LOBI UTAMA (TENGAH)
  // =========================================================================
  const Z1 = window.DATA_ZON1;
  addCarpet(0, 7.2, 3.2, 12.5);
  addCarpet(-7.5, 0, 9.0, 2.8);
  addCarpet(7.5, 0, 9.0, 2.8);
  addCarpet(0, -5.2, 2.8, 9.5);
  addChandelier(0, 6.2, 6.5);
  addChandelier(0, 6.2, -5.0);

  addMaritimeMonument(0, 5.2);
  addArtifactVase(-4.8, 1.0, "ming");
  addArtifactVase(4.8, 1.0, "ottoman");

  addWall(0, 3.9, 14, 24.6, 7.8, 0.6);
  addWall(-12, 3.9, 8.5, 0.6, 7.8, 11);
  addWall(-12, 3.9, -6.5, 0.6, 7.8, 7);
  addWall(12, 3.9, 8.5, 0.6, 7.8, 11);
  addWall(12, 3.9, -6.5, 0.6, 7.8, 7);
  addWall(-7.75, 3.9, -10, 8.5, 7.8, 0.6);
  addWall(7.75, 3.9, -10, 8.5, 7.8, 0.6);

  addWall(0, 3.4, 0, 11.4, 6.8, 0.8, matNavyWall, matTerracotta);

  placePanel(createTextPanel({
    stepBadge: Z1.tajukUtama.label,
    title: Z1.tajukUtama.tajuk,
    body: "",
    width: 9.6, height: 2.5, canvasW: 2200, canvasH: 620, titleSize: 52,
    headerColor: "#d96b27"
  }), 0, 4.95, 0.45, 0);

  const ahliFormatted = Z1.ahliKumpulan.senarai
    .map((a, idx) => `${idx + 1}. ${a.nama}   |   Kumpulan: ${a.kumpulan}   |   Angka Giliran: ${a.angkaGiliran}`)
    .join("\n");
  placePanel(createTextPanel({
    stepBadge: Z1.ahliKumpulan.tajuk,
    title: "Senarai Ahli Kumpulan & Maklumat Akademik",
    body: ahliFormatted,
    width: 9.6, height: 2.5, canvasW: 2200, canvasH: 620, titleSize: 38, bodySize: 35,
    headerColor: "#166953"
  }), 0, 1.95, 0.45, 0);

  placePanel(createTextPanel({
    stepBadge: "PANDUAN SUSUNAN PAMERAN (IKUT ARAH INI)",
    title: "Cara Meneroka Muzium Tanpa Sesat",
    body: "• ZON 1 (LOBI UTAMA): Baca Persoalan Inkuiri (Dinding Kiri) & Pendirian Tesis (Dinding Kanan).\n• ZON 2 (SAYAP KIRI): Kajian Kes 1 — Pelayaran Laksamana Zheng He (Dinasti Ming, 1405–1433).\n• ZON 3 (SAYAP KANAN): Kajian Kes 2 — Kuasa Maritim Empayar Uthmaniyah (Abad ke-16).\n• ZON 4 (SAYAP BELAKANG): Galeri Perbandingan Komprehensif & Rumusan Akhir.",
    width: 9.2, height: 4.3, canvasW: 2200, canvasH: 1120, titleSize: 40, bodySize: 31,
    headerColor: "#d96b27"
  }), 0, 3.4, -0.45, Math.PI);

  placePanel(createTextPanel({
    stepBadge: "LOBI — BACAAN 1 / 2",
    title: Z1.persoalanInkuiri.tajuk,
    body: Z1.persoalanInkuiri.teks,
    width: 8.2, height: 4.2, canvasW: 2150, canvasH: 1120, titleSize: 42, bodySize: 35,
    headerColor: "#166953"
  }), -11.65, 3.2, 8.2, Math.PI / 2);

  placePanel(createRoadSign({
    text: "← ZON 2:\nGALERI ZHENG HE",
    subtext: "Masuk Pintu Kiri (Dinasti Ming)",
    width: 4.4, height: 2.5, bgColor: "#166953"
  }), -11.65, 3.1, -6.5, Math.PI / 2);

  placePanel(createTextPanel({
    stepBadge: "LOBI — BACAAN 2 / 2",
    title: Z1.pendirianTesis.tajuk,
    body: Z1.pendirianTesis.perenggan.join("\n\n"),
    width: 8.2, height: 4.4, canvasW: 2200, canvasH: 1180, titleSize: 40, bodySize: 27,
    headerColor: "#d96b27"
  }), 11.65, 3.2, 8.2, -Math.PI / 2);

  placePanel(createRoadSign({
    text: "ZON 3:\nEMPAYAR UTHMANIYAH →",
    subtext: "Masuk Pintu Kanan (Abad ke-16)",
    width: 4.4, height: 2.5, bgColor: "#1b7f8c"
  }), 11.65, 3.1, -6.5, -Math.PI / 2);

  placePanel(createRoadSign({
    text: "← KIRI: ZON 2\n(GALERI ZHENG HE)",
    subtext: "Tamadun China (1405–1433)",
    width: 4.8, height: 2.6, bgColor: "#166953"
  }), -7.75, 3.1, -9.65, 0);

  placePanel(createRoadSign({
    text: "KANAN: ZON 3 →\n(EMPAYAR UTHMANIYAH)",
    subtext: "Tamadun Islam (Abad ke-16)",
    width: 4.8, height: 2.6, bgColor: "#1b7f8c"
  }), 7.75, 3.1, -9.65, 0);

  placePanel(createRoadSign({
    text: "← ZON 2: GALERI ZHENG HE",
    width: 4.8, height: 1.25, bgColor: "#166953"
  }), -11.65, 6.4, 0, Math.PI / 2);

  placePanel(createRoadSign({
    text: "ZON 3: GALERI UTHMANIYAH →",
    width: 4.8, height: 1.25, bgColor: "#1b7f8c"
  }), 11.65, 6.4, 0, -Math.PI / 2);

  placePanel(createRoadSign({
    text: "↑ ZON 4: PERBANDINGAN & RUMUSAN ↑",
    width: 5.4, height: 1.25, bgColor: "#d96b27"
  }), 0, 6.4, -9.65, 0);


  // =========================================================================
  // ZON 2: GALERI ZHENG HE (SAYAP KIRI: x = -12 hingga -56, z = -14 hingga +14)
  // =========================================================================
  const Z2 = window.DATA_ZON2;
  addCarpet(-34, 0, 40, 2.8);
  addChandelier(-25, 6.2, 0);
  addChandelier(-44, 6.2, 0);
  addArtifactVase(-27, -12.3, "ming");
  addArtifactVase(-46, -12.3, "ming");
  addArtifactVase(-46, 12.3, "ming");
  addGlassVitrine(-34, -6.5);
  addGlassVitrine(-34, 6.5);

  addWall(-34, 3.9, -14, 44.6, 7.8, 0.6, matNavyWall, matEmerald);
  addWall(-56, 3.9, 0, 0.6, 7.8, 28.6, matNavyWall, matEmerald);
  addWall(-34, 3.9, 14, 44.6, 7.8, 0.6, matNavyWall, matEmerald);
  addWall(-12, 3.9, -8.5, 0.6, 7.8, 11, matNavyWall, matEmerald);

  placePanel(createTextPanel({
    stepBadge: "ZON 2 — LANGKAH 1 / 8 (ORGANISASI ARMADA MING)",
    title: Z2.bahagian1.pembentukan.tajuk,
    body: `${Z2.bahagian1.pembentukan.teks}\n\n• ${Z2.bahagian1.analisis.tajuk}: ${Z2.bahagian1.analisis.teks}`,
    width: 7.4, height: 4.0, canvasW: 2300, canvasH: 1180, titleSize: 35, bodySize: 27,
    headerColor: "#166953"
  }), -25.4, 3.2, -13.65, 0);

  const z2KompBody = Z2.bahagian1.komponen
    .map(k => `• ${k.tajuk}: ${k.teks}`)
    .join("\n\n");
  placePanel(createTextPanel({
    stepBadge: "ZON 2 — LANGKAH 2 / 8 (EMPAT KOMPONEN INSTITUSI)",
    title: "Struktur Kepimpinan, Tentera, Navigasi & Depot Ming",
    body: z2KompBody,
    width: 7.4, height: 4.0, canvasW: 2400, canvasH: 1180, titleSize: 37, bodySize: 26,
    headerColor: "#166953"
  }), -34.0, 3.2, -13.65, 0);

  const z2StratBody = `${Z2.bahagian2.wilayahA.tajuk}\n${Z2.bahagian2.wilayahA.teks}\n\n${Z2.bahagian2.wilayahB.tajuk}\n${Z2.bahagian2.wilayahB.teks}`;
  placePanel(createTextPanel({
    stepBadge: "ZON 2 — LANGKAH 3 / 8 (STRATEGI & TAKTIK WILAYAH)",
    title: "Pengamanan Selat Melaka & Diplomasi Kapal Perang India",
    body: z2StratBody,
    width: 7.4, height: 4.0, canvasW: 2450, canvasH: 1200, titleSize: 35, bodySize: 23,
    headerColor: "#166953"
  }), -42.6, 3.2, -13.65, 0);

  placePanel(createTablePanel({
    stepBadge: "ZON 2 — LANGKAH 4 / 8 (JADUAL PERBANDINGAN WILAYAH)",
    title: Z2.bahagian2.jadualPerbandingan.tajuk,
    headers: Z2.bahagian2.jadualPerbandingan.headers,
    rows: Z2.bahagian2.jadualPerbandingan.rows,
    colRatios: [0.16, 0.28, 0.28, 0.28],
    width: 7.4, height: 4.2, canvasW: 2250, canvasH: 1180, fontSize: 25,
    headerColor: "#166953"
  }), -55.65, 3.2, -9.0, Math.PI / 2);

  const z2TekBody = `${Z2.bahagian3.tekA.tajuk}\n${Z2.bahagian3.tekA.teks}\n\n${Z2.bahagian3.tekB.tajuk}\n${Z2.bahagian3.tekB.teks}\n\n${Z2.bahagian3.tekC.tajuk}\n${Z2.bahagian3.tekC.teks}`;
  placePanel(createTextPanel({
    stepBadge: "ZON 2 — LANGKAH 5 / 8 (TEKNOLOGI PELAYARAN & PERSENJATAAN)",
    title: "Kapal Harta (Baochuan), Kompas Luopan & Senjata Api",
    body: z2TekBody,
    width: 7.4, height: 4.3, canvasW: 2300, canvasH: 1250, titleSize: 35, bodySize: 22,
    headerColor: "#166953"
  }), -55.65, 3.2, 0.0, Math.PI / 2);

  placePanel(createMapFrame(
    Z2.petaImageUrl,
    ["rajah1.jpg", "rajah1.png", "Rajah 1.jpg", "Rajah 1.png"],
    "Rajah 1 – Voyages of Zheng He (1405–1433)",
    5.6, 3.9
  ), -55.65, 3.2, 8.8, Math.PI / 2);

  placePanel(createTextPanel({
    stepBadge: "ZON 2 — LANGKAH 6 / 8 (← RUJUK PETA RAJAH 1 DI SEBELAH KIRI)",
    title: Z2.bahagian5.tajukPeta,
    body: `${Z2.bahagian5.kapsyenPeta}\n\n${Z2.bahagian5.anotasi51.tajuk}\n${Z2.bahagian5.anotasi51.teks}`,
    width: 8.2, height: 4.1, canvasW: 2450, canvasH: 1200, titleSize: 34, bodySize: 22,
    headerColor: "#d96b27"
  }), -44.5, 3.2, 13.65, Math.PI);

  const allMingRows = [...Z2.bahagian5.garisMasa53.rows1, ...Z2.bahagian5.garisMasa53.rows2];
  placePanel(createTablePanel({
    stepBadge: "ZON 2 — LANGKAH 7 / 8 (GARIS MASA PELAYARAN 1–7)",
    title: "Garis Masa Bersepadu Ekspedisi Laksamana Zheng He (1405–1433)",
    headers: Z2.bahagian5.garisMasa53.headers,
    rows: allMingRows,
    colRatios: [0.13, 0.15, 0.34, 0.38],
    width: 8.6, height: 4.1, canvasW: 2500, canvasH: 1180, fontSize: 22,
    headerColor: "#166953"
  }), -31.5, 3.2, 13.65, Math.PI);

  const z2WarisanBody = `${Z2.bahagian5.analisis54.tajuk}: ${Z2.bahagian5.analisis54.teks}\n\n• ${Z2.bahagian6.panel1.tajuk}: ${Z2.bahagian6.panel1.teks}\n• ${Z2.bahagian6.panel2.tajuk}: ${Z2.bahagian6.panel2.teks}\n• ${Z2.bahagian6.panel3.tajuk}: ${Z2.bahagian6.panel3.teks}`;
  placePanel(createTextPanel({
    stepBadge: "ZON 2 — LANGKAH 8 / 8 (HUBUNGAN TIMBAL BALIK, MOTIF & WARISAN)",
    title: "Sintesis Kajian Kes Dinasti Ming (1405–1433)",
    body: z2WarisanBody,
    width: 8.2, height: 4.1, canvasW: 2450, canvasH: 1200, titleSize: 35, bodySize: 23,
    headerColor: "#166953"
  }), -18.5, 3.2, 13.65, Math.PI);

  const mingBuktiRows = [
    ["Ying-yai Sheng-lan (1433/1451)", "Catatan saksi mata jurubahasa Ma Huan tentang tatacara perdagangan & diplomasi ufti di Melaka, Calicut dan Hormuz.", "Bias Sino-sentrik yang menonjolkan keunggulan Maharaja Ming."],
    ["Zheng He Hanghai Tu (Peta Mao Kun)", "Carta navigasi 20 kaki dengan panduan kompas 24-mata (luopan), jarak geng & rajah cerapan bintang.", "Salinan cetakan semula tahun 1621; bukan peta berskala moden."]
  ];
  placePanel(createTablePanel({
    stepBadge: "ZON 2 — LAMPIRAN BUKTI PRIMER DINASTI MING",
    title: "Penilaian Kritis Sumber Primer Pelayaran Zheng He",
    headers: ["Sumber Primer", "Asal-Usul, Konteks & Kegunaan", "Batas Sumber"],
    rows: mingBuktiRows,
    colRatios: [0.26, 0.44, 0.30],
    width: 7.8, height: 4.2, canvasW: 2300, canvasH: 1140, fontSize: 25,
    headerColor: "#166953"
  }), -12.35, 3.2, 8.8, -Math.PI / 2);


  // =========================================================================
  // ZON 3: GALERI EMPAYAR UTHMANIYAH (SAYAP KANAN: x = +12 hingga +56, z = -14 hingga +14)
  // =========================================================================
  const Z3 = window.DATA_ZON3;
  addCarpet(34, 0, 40, 2.8);
  addChandelier(25, 6.2, 0);
  addChandelier(44, 6.2, 0);
  addArtifactVase(27, -12.3, "ottoman");
  addArtifactVase(46, -12.3, "ottoman");
  addArtifactVase(46, 12.3, "ottoman");
  addGlassVitrine(34, -6.5);
  addGlassVitrine(34, 6.5);

  addWall(34, 3.9, -14, 44.6, 7.8, 0.6, matNavyWall, matTurquoise);
  addWall(56, 3.9, 0, 0.6, 7.8, 28.6, matNavyWall, matTurquoise);
  addWall(34, 3.9, 14, 44.6, 7.8, 0.6, matNavyWall, matTurquoise);
  addWall(12, 3.9, -8.5, 0.6, 7.8, 11, matNavyWall, matTurquoise);

  placePanel(createTextPanel({
    stepBadge: "ZON 3 — LANGKAH 1 / 8 (ORGANISASI ARMADA UTHMANIYAH)",
    title: Z3.bahagian1.pengenalan.tajuk,
    body: `${Z3.bahagian1.pengenalan.teks}\n\n• ${Z3.bahagian1.analisis.tajuk}: ${Z3.bahagian1.analisis.teks}`,
    width: 7.4, height: 4.0, canvasW: 2300, canvasH: 1180, titleSize: 35, bodySize: 27,
    headerColor: "#1b7f8c"
  }), 25.4, 3.2, -13.65, 0);

  const z3KompBody = Z3.bahagian1.komponen
    .map(k => `• ${k.tajuk}: ${k.teks}`)
    .join("\n\n");
  placePanel(createTextPanel({
    stepBadge: "ZON 3 — LANGKAH 2 / 8 (EMPAT KOMPONEN INSTITUSI)",
    title: "Kapudan Pasha, Limbungan Tersane-i Amire, Pangkalan & Kor Tentera",
    body: z3KompBody,
    width: 7.4, height: 4.0, canvasW: 2400, canvasH: 1180, titleSize: 36, bodySize: 26,
    headerColor: "#1b7f8c"
  }), 34.0, 3.2, -13.65, 0);

  const z3StratBody = `${Z3.bahagian2.lautMerah.tajuk}\n${Z3.bahagian2.lautMerah.teks}\n\n${Z3.bahagian2.lautanHindi.tajuk}\n${Z3.bahagian2.lautanHindi.teks}`;
  placePanel(createTextPanel({
    stepBadge: "ZON 3 — LANGKAH 3 / 8 (STRATEGI & TAKTIK MEDAN OPERASI)",
    title: "Zon Penampan Laut Merah & Ekspedisi Lautan Hindi–Aceh",
    body: z3StratBody,
    width: 7.4, height: 4.0, canvasW: 2450, canvasH: 1200, titleSize: 35, bodySize: 23,
    headerColor: "#1b7f8c"
  }), 42.6, 3.2, -13.65, 0);

  placePanel(createTablePanel({
    stepBadge: "ZON 3 — LANGKAH 4 / 8 (JADUAL PERBANDINGAN MEDAN)",
    title: Z3.bahagian2.jadualPerbandingan.tajuk,
    headers: Z3.bahagian2.jadualPerbandingan.headers,
    rows: Z3.bahagian2.jadualPerbandingan.rows,
    colRatios: [0.16, 0.28, 0.28, 0.28],
    width: 7.4, height: 4.2, canvasW: 2250, canvasH: 1180, fontSize: 25,
    headerColor: "#1b7f8c"
  }), 55.65, 3.2, -9.0, -Math.PI / 2);

  const z3TekBody = `${Z3.bahagian3.tekA.tajuk}\n${Z3.bahagian3.tekA.teks}\n\n${Z3.bahagian3.tekB.tajuk}\n${Z3.bahagian3.tekB.teks}\n\n${Z3.bahagian3.tekC.tajuk}\n${Z3.bahagian3.tekC.teks}`;
  placePanel(createTextPanel({
    stepBadge: "ZON 3 — LANGKAH 5 / 8 (TEKNOLOGI GALLEY, KARTOGRAFI & ARTILERI)",
    title: "Kapal Galley (Kadırga), Kitāb-ı Bahriye & Meriam ke Aceh",
    body: z3TekBody,
    width: 7.4, height: 4.3, canvasW: 2300, canvasH: 1250, titleSize: 35, bodySize: 22,
    headerColor: "#1b7f8c"
  }), 55.65, 3.2, 0.0, -Math.PI / 2);

  placePanel(createMapFrame(
    Z3.petaImageUrl,
    [
      "Uthmaniyah_ Laluan Kuasa Maritim 1517–1589.png",
      "Uthmaniyah_ Laluan Kuasa Maritim 1517-1589.png",
      "rajah2.png",
      "rajah2.jpg",
      "Rajah 2.png",
      "Rajah 2.jpg"
    ],
    "Rajah 2 – Laluan Kuasa Maritim Empayar Uthmaniyah (1517–1589)",
    5.6, 3.9
  ), 55.65, 3.2, 8.8, -Math.PI / 2);

  placePanel(createTextPanel({
    stepBadge: "ZON 3 — LANGKAH 6 / 8 (RUJUK PETA RAJAH 2 DI SEBELAH KANAN →)",
    title: Z3.bahagian5.tajukPeta,
    body: `${Z3.bahagian5.kapsyenPeta}\n\n${Z3.bahagian5.anotasi51.tajuk}\n${Z3.bahagian5.anotasi51.teks}`,
    width: 8.2, height: 4.1, canvasW: 2450, canvasH: 1200, titleSize: 34, bodySize: 22,
    headerColor: "#d96b27"
  }), 44.5, 3.2, 13.65, Math.PI);

  const allOttomanRows = [...Z3.bahagian5.garisMasa53.rows1, ...Z3.bahagian5.garisMasa53.rows2];
  placePanel(createTablePanel({
    stepBadge: "ZON 3 — LANGKAH 7 / 8 (GARIS MASA EKSPEDISI 1517–1589)",
    title: "Garis Masa Operasi Maritim Empayar Uthmaniyah (Abad ke-16)",
    headers: Z3.bahagian5.garisMasa53.headers,
    rows: allOttomanRows,
    colRatios: [0.16, 0.36, 0.48],
    width: 8.6, height: 4.1, canvasW: 2500, canvasH: 1200, fontSize: 21,
    headerColor: "#1b7f8c"
  }), 31.5, 3.2, 13.65, Math.PI);

  const z3WarisanBody = `${Z3.bahagian5.analisis54.tajuk}: ${Z3.bahagian5.analisis54.teks}\n\n• ${Z3.bahagian6.panel61.tajuk}: ${Z3.bahagian6.panel61.teks}\n• ${Z3.bahagian6.panel63.tajuk}: ${Z3.bahagian6.panel63.teks}\n• ${Z3.bahagian6.panel64.tajuk}: ${Z3.bahagian6.panel64.teks}`;
  placePanel(createTextPanel({
    stepBadge: "ZON 3 — LANGKAH 8 / 8 (HUBUNGAN TIMBAL BALIK, HAD & WARISAN)",
    title: "Sintesis Kajian Kes Empayar Uthmaniyah (Abad ke-16)",
    body: z3WarisanBody,
    width: 8.2, height: 4.1, canvasW: 2450, canvasH: 1200, titleSize: 35, bodySize: 23,
    headerColor: "#1b7f8c"
  }), 18.5, 3.2, 13.65, Math.PI);

  placePanel(createTablePanel({
    stepBadge: "ZON 3 — RUMUSAN DAPATAN & SUMBER PRIMER UTHMANIYAH",
    title: Z3.bahagian6.jadualRumusan.tajuk,
    headers: Z3.bahagian6.jadualRumusan.headers,
    rows: [
      ...Z3.bahagian6.jadualRumusan.rows,
      ["Sumber Primer Utama", "Kitāb-ı Bahriye (Piri Reis, 1525) & Mir’āt al-Mamālik (Seydi Ali Reis, 1557).", "Peta awal fokus Mediterranean; catatan Seydi Ali membela kehilangan kapal ribut."]
    ],
    colRatios: [0.22, 0.39, 0.39],
    width: 7.8, height: 4.2, canvasW: 2300, canvasH: 1140, fontSize: 25,
    headerColor: "#1b7f8c"
  }), 12.35, 3.2, 8.8, Math.PI / 2);


  // =========================================================================
  // ZON 4: GALERI PERBANDINGAN & RUMUSAN (SAYAP BELAKANG: x = -21..+21, z = -10..-48)
  // =========================================================================
  const Z4 = window.DATA_ZON4;
  addCarpet(0, -29, 3.2, 36);
  addChandelier(0, 6.2, -22);
  addChandelier(0, 6.2, -38);
  addArtifactVase(-18.5, -11.5, "ming");
  addArtifactVase(18.5, -11.5, "ottoman");
  addArtifactVase(-18.5, -46.2, "ming");
  addArtifactVase(18.5, -46.2, "ottoman");
  addGlassVitrine(-8.0, -29);
  addGlassVitrine(8.0, -29);

  addWall(-21, 3.9, -29, 0.6, 7.8, 38.6, matNavyWall, matTerracotta);
  addWall(21, 3.9, -29, 0.6, 7.8, 38.6, matNavyWall, matTerracotta);
  addWall(0, 3.9, -48, 42.6, 7.8, 0.6, matNavyWall, matTerracotta);
  addWall(-12.25, 3.9, -10, 17.5, 7.8, 0.6, matNavyWall, matTerracotta);
  addWall(12.25, 3.9, -10, 17.5, 7.8, 0.6, matNavyWall, matTerracotta);

  // Dinding Kiri Zon 4: anjakkan Langkah 3 -> Langkah 2 -> Langkah 1 ke kanan pandangan pengguna (-Z)
  // dengan jarak rapat supaya ketiga-tiga frame muat penuh tanpa bertindih
  const cmpColors = ["#0b2242", "#166953", "#1b7f8c"];

  placePanel(createTablePanel({
    stepBadge: "ZON 4 — LANGKAH 3 / 7 (JADUAL PERBANDINGAN BAHAGIAN 2)",
    title: Z4.bahagian2.tajuk2,
    headers: Z4.bahagian2.headers,
    rows: Z4.bahagian2.rows2,
    colRatios: [0.20, 0.40, 0.40],
    width: 7.4, height: 3.9, canvasW: 2450, canvasH: 1180, fontSize: 24,
    headerColor: "#d96b27", colHeaderColors: cmpColors
  }), -20.65, 3.2, -21.0, Math.PI / 2);

  placePanel(createTablePanel({
    stepBadge: "ZON 4 — LANGKAH 2 / 7 (JADUAL PERBANDINGAN BAHAGIAN 1)",
    title: Z4.bahagian2.tajuk1,
    headers: Z4.bahagian2.headers,
    rows: Z4.bahagian2.rows1,
    colRatios: [0.20, 0.40, 0.40],
    width: 7.4, height: 3.9, canvasW: 2500, canvasH: 1200, fontSize: 24,
    headerColor: "#d96b27", colHeaderColors: cmpColors
  }), -20.65, 3.2, -29.2, Math.PI / 2);

  placePanel(createTextPanel({
    stepBadge: "ZON 4 — LANGKAH 1 / 7 (PENGENALAN ANALISIS PERBANDINGAN)",
    title: `${Z4.tajukGaleri} — ${Z4.bahagian1.tajuk}`,
    body: Z4.bahagian1.teks,
    width: 7.4, height: 3.9, canvasW: 2300, canvasH: 1160, titleSize: 35, bodySize: 28,
    headerColor: "#d96b27"
  }), -20.65, 3.2, -37.4, Math.PI / 2);

  // Dinding Utara & Kanan Zon 4 (Dikekalkan seperti sebelumnya)
  const z4FaktorBody = `${Z4.bahagian3.panel31.tajuk}\n${Z4.bahagian3.panel31.teks}\n\n${Z4.bahagian3.panel32.tajuk}\n${Z4.bahagian3.panel32.teks}\n\n${Z4.bahagian3.panel33.tajuk}\n${Z4.bahagian3.panel33.teks}`;
  placePanel(createTextPanel({
    stepBadge: "ZON 4 — LANGKAH 4 / 7 (FAKTOR PERBEZAAN KAWALAN & KESAN)",
    title: "Mengapakah Bentuk Kawalan & Kesannya Berbeza?",
    body: z4FaktorBody,
    width: 13.0, height: 4.4, canvasW: 2800, canvasH: 1120, titleSize: 36, bodySize: 22,
    headerColor: "#d96b27"
  }), -9.2, 3.2, -47.65, 0);

  const z4Bukti3Body = `${Z4.bahagian4.pengenalan.teks}\n\n${Z4.bahagian4.bukti41.tajuk}\n${Z4.bahagian4.bukti41.teks}\n\n${Z4.bahagian4.bukti42.tajuk}\n${Z4.bahagian4.bukti42.teks}`;
  placePanel(createTextPanel({
    stepBadge: "ZON 4 — LANGKAH 5 / 7 (PENILAIAN SILANG BUKTI PIHAK KETIGA)",
    title: "Perspektif Pengembara Eropah: Tomé Pires & Antonio Pigafetta",
    body: z4Bukti3Body,
    width: 13.0, height: 4.4, canvasW: 2800, canvasH: 1120, titleSize: 36, bodySize: 22,
    headerColor: "#166953"
  }), 9.2, 3.2, -47.65, 0);

  placePanel(createTablePanel({
    stepBadge: "ZON 4 — LANGKAH 6 / 7 (JADUAL PENILAIAN SILANG SUMBER EROPAH)",
    title: Z4.bahagian4.jadualSilang.tajuk,
    headers: Z4.bahagian4.jadualSilang.headers,
    rows: Z4.bahagian4.jadualSilang.rows,
    colRatios: [0.22, 0.24, 0.30, 0.24],
    width: 8.8, height: 4.3, canvasW: 2450, canvasH: 1180, fontSize: 24,
    headerColor: "#1b7f8c"
  }), 20.65, 3.2, -38.8, -Math.PI / 2);

  placePanel(createTextPanel({
    stepBadge: "ZON 4 — LANGKAH 7 / 7 (RUMUSAN AKHIR & PENGESAHAN TESIS)",
    title: Z4.bahagian5.tajuk,
    body: Z4.bahagian5.teks,
    width: 9.6, height: 4.4, canvasW: 2450, canvasH: 1160, titleSize: 37, bodySize: 27,
    headerColor: "#d96b27"
  }), 20.65, 3.2, -24.0, -Math.PI / 2);


  // =========================================================================
  // KAWALAN PERGERAKAN, TELEPORT PANTAS & PENUNJUK ZON
  // =========================================================================
  let yaw = 0;
  const moveSpeed = 0.18;
  const rotSpeed = 0.034;
  const zoneLabel = document.getElementById("zone-indicator");

  function updateZoneHUD(x, z) {
    if (x >= -12 && x <= 12 && z >= -10 && z <= 14) {
      zoneLabel.textContent = "Zon 1: Lobi Utama (Tajuk & Ahli Ahli Parameswara)";
    } else if (x < -12) {
      zoneLabel.textContent = "Zon 2 (Sayap Kiri): Pelayaran Laksamana Zheng He (1405–1433)";
    } else if (x > 12) {
      zoneLabel.textContent = "Zon 3 (Sayap Kanan): Kuasa Maritim Empayar Uthmaniyah (Abad ke-16)";
    } else {
      zoneLabel.textContent = "Zon 4 (Sayap Belakang): Galeri Perbandingan dan Rumusan";
    }
  }

  window.teleportTo = function (target) {
    if (target === "lobby") {
      camera.position.set(0, 2.35, 11.2);
      yaw = 0;
    } else if (target === "zon2") {
      camera.position.set(-15.5, 2.35, 0);
      yaw = Math.PI / 2;
    } else if (target === "zon3") {
      camera.position.set(15.5, 2.35, 0);
      yaw = -Math.PI / 2;
    } else if (target === "zon4") {
      camera.position.set(0, 2.35, -13.5);
      yaw = 0;
    }
    camera.rotation.y = yaw;
    updateZoneHUD(camera.position.x, camera.position.z);
  };

  const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
  window.addEventListener("keydown", (e) => {
    if (e.code in keys) { keys[e.code] = true; e.preventDefault(); }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code in keys) { keys[e.code] = false; }
  });

  function canMoveTo(nx, nz) {
    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i];
      if (nx > c.minX && nx < c.maxX && nz > c.minZ && nz < c.maxZ) return false;
    }
    return true;
  }

  function animate() {
    requestAnimationFrame(animate);
    if (keys.ArrowLeft) yaw += rotSpeed;
    if (keys.ArrowRight) yaw -= rotSpeed;
    camera.rotation.y = yaw;

    let step = 0;
    if (keys.ArrowUp) step += moveSpeed;
    if (keys.ArrowDown) step -= moveSpeed;

    if (step !== 0) {
      const dx = -Math.sin(yaw) * step;
      const dz = -Math.cos(yaw) * step;
      if (canMoveTo(camera.position.x + dx, camera.position.z)) camera.position.x += dx;
      if (canMoveTo(camera.position.x, camera.position.z + dz)) camera.position.z += dz;
      updateZoneHUD(camera.position.x, camera.position.z);
    }
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
})();