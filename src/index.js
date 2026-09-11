const SESSION_COOKIE = "kouza_admin_session";

const RATING_FIELDS = [
  { name: "rating_result", label: "施術の仕上がりへの満足度", scaleLabels: ["低い", "高い"] },
  { name: "rating_staff", label: "スタッフの対応・接客" },
  { name: "rating_explanation", label: "施術内容・アドバイスの説明のわかりやすさ" },
  { name: "rating_ambience", label: "店内の雰囲気・清潔感" },
  { name: "rating_revisit", label: "次回もまた利用したいか", scaleLabels: ["利用しない", "ぜひ利用したい"] },
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap">
<style>
  :root{
    --bg: #F7EEE4;
    --surface: #FFFCF9;
    --ink: #4A3A32;
    --ink-soft: #8C7768;
    --ink-faint: #B4A292;
    --accent: #C48577;
    --accent-strong: #A05F52;
    --accent-tint: #F1D9D1;
    --line: #E6D6C6;
    --button: #D9793B;
    --button-shadow: rgba(180, 96, 32, 0.35);
    --shadow: 0 20px 40px -28px rgba(90, 62, 46, 0.35);
    --err: #B3423A;
  }
  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; }
  body{
    background: var(--bg);
    color: var(--ink);
    font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }
  h1{ font-family: "Zen Maru Gothic", "Noto Sans JP", sans-serif; text-wrap: balance; margin: 0 0 8px; font-weight: 700; }
  .wrap{ max-width: 480px; margin: 40px auto; padding: 0 20px 60px; }
  .card{ background: var(--surface); border: 1px solid var(--line); border-radius: 24px; box-shadow: var(--shadow); padding: 30px 26px 32px; }
  h1{ font-size: 22px; }
  .lead{ font-size: 13.5px; color: var(--ink-soft); margin: 0 0 26px; }

  .field{ margin-bottom: 22px; }
  .field label.field-label{ display:block; font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
  .field .hint{ font-size: 11.5px; color: var(--ink-faint); font-weight: 400; margin-left: 4px; }

  input[type=text], textarea{
    width: 100%; font: inherit; font-size: 14px; color: var(--ink);
    background: #FFFFFF; border: 1.5px solid var(--line); border-radius: 12px; padding: 11px 14px;
  }
  textarea{ min-height: 90px; resize: vertical; font-family: inherit; }

  .rating-row{ display:flex; gap:8px; }
  .pill{ position:relative; flex:1; }
  .pill input{ position:absolute; opacity:0; inset:0; width:100%; height:100%; margin:0; cursor:pointer; }
  .pill span{
    display:flex; align-items:center; justify-content:center; height:40px; border-radius:10px;
    border:1.5px solid var(--line); background:#FFFFFF; color:var(--ink-soft);
    font-size:14px; font-weight:600; font-variant-numeric: tabular-nums;
  }
  .pill input:checked + span{
    background: var(--accent); border-color: var(--accent-strong); color:#FFF7F3;
    box-shadow: 0 6px 14px -6px rgba(160, 95, 82, 0.55);
  }
  .rating-scale-labels{ display:flex; justify-content:space-between; font-size:10.5px; color:var(--ink-faint); margin-top:6px; padding:0 2px; }

  button.submit-btn{
    width:100%; border:none; border-radius:12px; background: var(--button); color:#FFF7F3;
    font: inherit; font-weight:700; font-size:15px; padding:14px; margin-top:8px; cursor:pointer;
    box-shadow: 0 10px 20px -10px var(--button-shadow);
  }
  button.submit-btn:hover{ filter: brightness(0.96); }

  .thanks{ text-align:center; }
  .table-wrap{ overflow-x:auto; margin-top:18px; border:1px solid var(--line); border-radius:14px; }
  table{ width:100%; border-collapse:collapse; font-size:13px; background:var(--surface); }
  th, td{ text-align:left; padding:10px 12px; border-bottom:1px solid var(--line); vertical-align:top; white-space:nowrap; }
  td.comment-cell{ white-space:normal; min-width:200px; }
  th{ color:var(--ink-soft); font-weight:600; background:var(--accent-tint); }
  tr:last-child td{ border-bottom:none; }
  .score{ font-weight:700; color:var(--accent-strong); font-variant-numeric: tabular-nums; }
  .empty{ color:var(--ink-faint); padding:24px 4px; }
  .err{ color:var(--err); font-size:13px; margin:0 0 16px; }
  a{ color:var(--accent-strong); }
  .top-row{ display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; }
  .top-row h1{ margin-bottom:0; }
</style>
</head>
<body>
<div class="wrap">
${body}
</div>
</body>
</html>`;
}

function ratingField(field) {
  const pills = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<label class="pill"><input type="radio" name="${field.name}" value="${n}" required><span>${n}</span></label>`
    )
    .join("");
  const scale = field.scaleLabels
    ? `<div class="rating-scale-labels"><span>${escapeHtml(field.scaleLabels[0])}</span><span>${escapeHtml(field.scaleLabels[1])}</span></div>`
    : "";
  return `<div class="field">
  <label class="field-label">${escapeHtml(field.label)}</label>
  <div class="rating-row">${pills}</div>
  ${scale}
</div>`;
}

function formPage(error) {
  return page(
    "施術後のアンケート",
    `<div class="card">
<h1>施術後のアンケート</h1>
<p class="lead">本日はご来店いただきありがとうございました。今後のサービス向上のため、感想をお聞かせください。</p>
${error ? `<p class="err">${escapeHtml(error)}</p>` : ""}
<form method="POST" action="/submit">
  <div class="field">
    <label class="field-label" for="nickname">お名前<span class="hint">（ニックネームでも可）</span></label>
    <input type="text" id="nickname" name="nickname" maxlength="50" required>
  </div>

  <div class="field">
    <label class="field-label" for="menu">本日受けた施術メニュー</label>
    <input type="text" id="menu" name="menu" maxlength="80" placeholder="例：フェイシャルエステ（60分）">
  </div>

  ${RATING_FIELDS.map(ratingField).join("\n")}

  <div class="field">
    <label class="field-label" for="comment">ご感想・ご要望<span class="hint">（自由にお書きください）</span></label>
    <textarea id="comment" name="comment" maxlength="2000"></textarea>
  </div>

  <button class="submit-btn" type="submit">送信する</button>
</form>
</div>`
  );
}

function thanksPage() {
  return page(
    "送信完了",
    `<div class="card thanks">
<h1>受け付けました</h1>
<p class="lead">ご回答ありがとうございました。</p>
</div>`
  );
}

function loginPage(error) {
  return page(
    "管理画面ログイン",
    `<div class="card">
<h1>管理画面</h1>
${error ? `<p class="err">${escapeHtml(error)}</p>` : ""}
<form method="POST" action="/admin/login">
  <div class="field">
    <label class="field-label" for="password">合言葉</label>
    <input type="text" id="password" name="password" required>
  </div>
  <button class="submit-btn" type="submit">開く</button>
</form>
</div>`
  );
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

async function isAuthed(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return false;
  const expected = await sha256Hex(env.ADMIN_PASSWORD);
  return token === expected;
}

function fmtScore(n) {
  return n === null || n === undefined ? "—" : `${escapeHtml(n)} / 5`;
}

async function adminListPage(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, nickname, menu, rating_result, rating_staff, rating_explanation, rating_ambience, rating_revisit, comment, created_at
     FROM responses ORDER BY id DESC`
  ).all();

  const rows =
    results.length === 0
      ? `<p class="empty">まだ回答がありません。</p>`
      : `<div class="table-wrap">
<table>
<thead><tr>
  <th>日時</th><th>お名前</th><th>メニュー</th>
  <th>仕上がり</th><th>接客</th><th>説明</th><th>雰囲気</th><th>次回利用</th>
  <th>感想</th>
</tr></thead>
<tbody>
${results
  .map(
    (r) => `<tr>
  <td>${escapeHtml(r.created_at)}</td>
  <td>${escapeHtml(r.nickname)}</td>
  <td>${r.menu ? escapeHtml(r.menu) : "—"}</td>
  <td class="score">${fmtScore(r.rating_result)}</td>
  <td class="score">${fmtScore(r.rating_staff)}</td>
  <td class="score">${fmtScore(r.rating_explanation)}</td>
  <td class="score">${fmtScore(r.rating_ambience)}</td>
  <td class="score">${fmtScore(r.rating_revisit)}</td>
  <td class="comment-cell">${escapeHtml(r.comment || "").replace(/\n/g, "<br>")}</td>
</tr>`
  )
  .join("\n")}
</tbody>
</table>
</div>`;

  return page(
    "アンケート回答一覧",
    `<div class="top-row"><h1>回答一覧（${results.length}件）</h1><a href="/admin/logout">ログアウト</a></div>
${rows}`
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(formPage(null), {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }

    if (request.method === "POST" && url.pathname === "/submit") {
      const form = await request.formData();
      const nickname = (form.get("nickname") || "").toString().trim();
      const menu = (form.get("menu") || "").toString().trim();
      const comment = (form.get("comment") || "").toString().trim();

      const ratings = {};
      let ratingsValid = true;
      for (const field of RATING_FIELDS) {
        const n = parseInt(form.get(field.name), 10);
        if (!(n >= 1 && n <= 5)) ratingsValid = false;
        ratings[field.name] = n;
      }

      if (!nickname || !ratingsValid) {
        return new Response(formPage("お名前と、すべての評価項目の入力をお願いします。"), {
          status: 400,
          headers: { "content-type": "text/html; charset=UTF-8" },
        });
      }

      await env.DB.prepare(
        `INSERT INTO responses
          (nickname, menu, rating_result, rating_staff, rating_explanation, rating_ambience, rating_revisit, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          nickname,
          menu || null,
          ratings.rating_result,
          ratings.rating_staff,
          ratings.rating_explanation,
          ratings.rating_ambience,
          ratings.rating_revisit,
          comment
        )
        .run();

      return Response.redirect(url.origin + "/thanks", 303);
    }

    if (request.method === "GET" && url.pathname === "/thanks") {
      return new Response(thanksPage(), {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }

    if (url.pathname === "/admin") {
      if (!(await isAuthed(request, env))) {
        return new Response(loginPage(null), {
          headers: { "content-type": "text/html; charset=UTF-8" },
        });
      }
      return new Response(await adminListPage(env), {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }

    if (request.method === "POST" && url.pathname === "/admin/login") {
      const form = await request.formData();
      const password = (form.get("password") || "").toString();

      if (password !== env.ADMIN_PASSWORD) {
        return new Response(loginPage("合言葉が違います。"), {
          status: 401,
          headers: { "content-type": "text/html; charset=UTF-8" },
        });
      }

      const token = await sha256Hex(env.ADMIN_PASSWORD);
      const headers = new Headers();
      headers.set("Location", "/admin");
      headers.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
      );
      return new Response(null, { status: 303, headers });
    }

    if (url.pathname === "/admin/logout") {
      const headers = new Headers();
      headers.set("Location", "/admin");
      headers.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
      );
      return new Response(null, { status: 303, headers });
    }

    return new Response("Not Found", { status: 404 });
  },
};
