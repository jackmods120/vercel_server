const posts = {};

module.exports = async (req, res) => {
  const url  = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname;

  // ── POST /register ──────────────────────────────────────
  if (req.method === "POST" && path === "/register") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { postId, category, text, username, mediaUrl } = JSON.parse(body);
        posts[postId] = { category, text, username, mediaUrl, ts: Date.now() };
        const link = `https://alighthelper.vercel.app/post/${category}/${postId}`;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, link }));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false }));
      }
    });
    return;
  }

  // ── GET /post/:category/:id ──────────────────────────────
  const match2 = path.match(/^\/post\/([^/]+)\/(.+)$/);
  if (match2) {
    const category = match2[1];
    const postId   = match2[2];
    const post     = posts[postId] || {};
    const { text = "", username = "Alight Helper", mediaUrl = "" } = post;
    // ئۆتۆماتیک بەرنامەکە کراوە دەکات
    const appLink  = `alighthelper://post/${category}/${postId}`;

    const ua = req.headers["user-agent"] || "";
    const isTelegram = ua.includes("TelegramBot") || ua.includes("Telegram");

    // ئەگەر تیلیگرامی بۆت preview — HTML پرۆپەرتی بنێرە
    // ئەگەر بەکارهێنەر — ریدایرێکت بکە بۆ app
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!DOCTYPE html>
<html lang="ku" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${username} — Alight Helper</title>

  <!-- Open Graph -->
  <meta property="og:title"       content="${username} — Alight Helper">
  <meta property="og:description" content="${text || 'پۆستێکی تازە لە Alight Helper'}">
  <meta property="og:url"         content="https://alighthelper.vercel.app/post/${category}/${postId}">
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="Alight Helper">
  ${mediaUrl ? `<meta property="og:image" content="${mediaUrl}">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">` : ''}
  <meta name="twitter:card"        content="${mediaUrl ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title"       content="${username} — Alight Helper">
  <meta name="twitter:description" content="${text || 'پۆستێکی تازە لە Alight Helper'}">
  ${mediaUrl ? `<meta name="twitter:image" content="${mediaUrl}">` : ''}

  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',sans-serif;background:#0f0f13;color:#fff;
         min-height:100vh;display:flex;flex-direction:column;
         align-items:center;justify-content:center;padding:24px;text-align:center}
    .logo{width:80px;height:80px;border-radius:20px;
          background:linear-gradient(135deg,#7c3aed,#2563eb);
          display:flex;align-items:center;justify-content:center;
          font-size:36px;margin:0 auto 20px;
          box-shadow:0 8px 32px rgba(124,58,237,.4)}
    h1{font-size:22px;font-weight:700;margin-bottom:8px}
    p{font-size:14px;color:rgba(255,255,255,.55);margin-bottom:32px;line-height:1.6}
    .btn{display:block;width:100%;max-width:320px;padding:14px 24px;
         border-radius:14px;font-size:16px;font-weight:600;
         text-decoration:none;margin:0 auto 12px;cursor:pointer;border:none}
    .btn-primary{background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;
                 box-shadow:0 4px 20px rgba(124,58,237,.35)}
    .btn-secondary{background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);
                   border:1px solid rgba(255,255,255,.12)}
    .card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          border-radius:16px;padding:16px;width:100%;max-width:320px;
          margin:0 auto 28px;text-align:right}
    .card-user{font-size:13px;font-weight:600;margin-bottom:6px;opacity:.7}
    .card-text{font-size:15px;line-height:1.6}
    .card-img{width:100%;border-radius:10px;margin-top:12px;object-fit:cover;max-height:200px}
    .spinner{width:32px;height:32px;border:3px solid rgba(255,255,255,.2);
             border-top-color:#7c3aed;border-radius:50%;
             animation:spin 0.8s linear infinite;margin:0 auto 16px}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>
</head>
<body>
  <div class="logo">✦</div>
  <div class="spinner" id="sp"></div>
  <h1>Alight Helper</h1>
  <p id="msg">کراوەکردنی بەرنامە...</p>

  <div class="card" id="card" style="display:none">
    <div class="card-user">👤 ${username}</div>
    ${text ? `<div class="card-text">${text}</div>` : ''}
    ${mediaUrl ? `<img class="card-img" src="${mediaUrl}" alt="post">` : ''}
  </div>

  <a class="btn btn-primary" href="${appLink}" id="openBtn" style="display:none">
    کراوەکردنی Alight Helper
  </a>
  <a class="btn btn-secondary" href="https://t.me/JACK_721_MOD" style="display:none" id="dlBtn">
    داگرتنی بەرنامەکە
  </a>

  <script>
    // ئۆتۆماتیک app کراوەدەکات
    window.location.href = "${appLink}";

    // دوای 2.5 چرکە ئەگەر app نەکرایەوە → دوگمەکان نیشاندەدەن
    setTimeout(function(){
      document.getElementById('sp').style.display='none';
      document.getElementById('msg').textContent='ئەگەر بەرنامەکە نەکرایەوە، دوگمەی خوارەوە بزەرێنە:';
      document.getElementById('card').style.display='block';
      document.getElementById('openBtn').style.display='block';
      document.getElementById('dlBtn').style.display='block';
    }, 2500);
  </script>
</body>
</html>`);
    return;
  }

  // ── GET /post/:id (کۆن — بۆ پشتگیری لینکی کۆن) ─────────
  const match1 = path.match(/^\/post\/([^/]+)$/);
  if (match1) {
    const postId  = match1[1];
    const post    = posts[postId] || {};
    const cat     = post.category || "codes";
    const appLink = `alighthelper://post/${cat}/${postId}`;
    res.setHeader("Content-Type","text/html;charset=utf-8");
    res.end(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${appLink}">
    <script>window.location.href="${appLink}";</script></head>
    <body><a href="${appLink}">کراوەکردنی بەرنامە</a></body></html>`);
    return;
  }

  // ── GET / ────────────────────────────────────────────────
  res.setHeader("Content-Type","text/html;charset=utf-8");
  res.end(`<!DOCTYPE html><html lang="ku" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Alight Helper</title>
<style>body{background:#0f0f13;color:#fff;font-family:'Segoe UI',sans-serif;
display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}
.logo{font-size:60px;margin-bottom:16px}h1{font-size:28px;font-weight:700}
p{color:rgba(255,255,255,.5);margin-top:8px}
a{color:#7c3aed;margin-top:24px;display:block;text-decoration:none;font-size:14px}</style></head>
<body><div>
  <div class="logo">✦</div>
  <h1>Alight Helper</h1>
  <p>بەرنامەی کوردی بۆ Alight Motion</p>
  <a href="https://t.me/JACK_721_MOD">📢 چەناڵی تیلیگرام</a>
</div></body></html>`);
};
