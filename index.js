const posts = {};

module.exports = async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname;

  // ── POST /register — بەرنامەکە پۆستەکە تۆمار دەکات ──
  if (req.method === "POST" && path === "/register") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { postId, category, text, username, mediaUrl } = data;
        posts[postId] = { category, text, username, mediaUrl, ts: Date.now() };
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, link: `https://alighthelper.vercel.app/post/${postId}` }));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false }));
      }
    });
    return;
  }

  // ── GET /post/:id — Deep Link ──
  const match = path.match(/^\/post\/(.+)$/);
  if (match) {
    const postId = match[1];
    const post = posts[postId] || {};
    const appLink = `alighthelper://post/${postId}`;
    const { text = "", username = "Alight Helper", mediaUrl = "" } = post;

    // ئەگەر بەرنامەکە داماوە → app دەکراتەوە، نەخێر → پەڕەی HTML
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!DOCTYPE html>
<html lang="ku" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${username} — Alight Helper</title>

  <!-- Open Graph (preview لە تیلیگرام و واتساپ) -->
  <meta property="og:title" content="${username} — Alight Helper">
  <meta property="og:description" content="${text || 'پۆستێکی تازە لە Alight Helper'}">
  ${mediaUrl ? `<meta property="og:image" content="${mediaUrl}">` : ''}
  <meta property="og:url" content="https://alighthelper.vercel.app/post/${postId}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Alight Helper">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${username} — Alight Helper">
  <meta name="twitter:description" content="${text || 'پۆستێکی تازە لە Alight Helper'}">
  ${mediaUrl ? `<meta name="twitter:image" content="${mediaUrl}">` : ''}

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0f0f13;
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .logo {
      width: 80px; height: 80px;
      border-radius: 20px;
      background: linear-gradient(135deg, #7c3aed, #2563eb);
      display: flex; align-items: center; justify-content: center;
      font-size: 36px;
      margin: 0 auto 20px;
      box-shadow: 0 8px 32px rgba(124,58,237,0.4);
    }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
    p  { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 32px; line-height: 1.6; }
    .btn {
      display: block; width: 100%; max-width: 320px;
      padding: 14px 24px;
      border-radius: 14px;
      font-size: 16px; font-weight: 600;
      text-decoration: none;
      margin: 0 auto 12px;
      cursor: pointer; border: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #7c3aed, #2563eb);
      color: #fff;
      box-shadow: 0 4px 20px rgba(124,58,237,0.35);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .post-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 16px;
      width: 100%; max-width: 320px;
      margin: 0 auto 28px;
      text-align: right;
    }
    .post-user { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .post-text { font-size: 14px; color: rgba(255,255,255,0.65); }
    ${mediaUrl ? `.post-img { width:100%; border-radius:10px; margin-top:10px; object-fit:cover; max-height:180px; }` : ''}
  </style>
</head>
<body>
  <div class="logo">✦</div>
  <h1>Alight Helper</h1>
  <p>پۆستێک لە Alight Helper بۆت شێر کراوە</p>

  <div class="post-card">
    <div class="post-user">👤 ${username}</div>
    ${text ? `<div class="post-text">${text}</div>` : ''}
    ${mediaUrl ? `<img class="post-img" src="${mediaUrl}" alt="post">` : ''}
  </div>

  <a class="btn btn-primary" href="${appLink}" id="openApp">کراوەکردنی Alight Helper</a>
  <a class="btn btn-secondary" href="https://play.google.com/store/apps">داگرتنی بەرنامەکە</a>

  <script>
    // ئۆتۆماتیک بەرنامەکە کراوەدەکات
    window.location.href = "${appLink}";
    setTimeout(() => {}, 2500);
  </script>
</body>
</html>`);
    return;
  }

  // ── GET / — سەرەکی ──
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!DOCTYPE html>
<html lang="ku" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Alight Helper</title>
  <style>
    body { background:#0f0f13; color:#fff; font-family:'Segoe UI',sans-serif;
           display:flex; align-items:center; justify-content:center;
           min-height:100vh; text-align:center; padding:24px; }
    .logo { font-size:60px; margin-bottom:16px; }
    h1 { font-size:28px; font-weight:700; }
    p  { color:rgba(255,255,255,0.5); margin-top:8px; }
  </style>
</head>
<body>
  <div>
    <div class="logo">✦</div>
    <h1>Alight Helper</h1>
    <p>بەرنامەی کوردی بۆ Alight Motion</p>
  </div>
</body>
</html>`);
};
