const SESSION_COOKIE = "kouza_admin_session";

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
<style>
  body { font-family: -apple-system, "Hiragino Kaku Gothic ProN", sans-serif; background:#f6f7f9; color:#222; margin:0; padding:0; }
  .wrap { max-width: 640px; margin: 40px auto; background:#fff; padding: 32px; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  h1 { font-size: 22px; margin-top:0; }
  label { display:block; margin-top: 18px; font-weight: bold; font-size: 14px; }
  input[type=text], textarea { width: 100%; box-sizing: border-box; padding: 10px; margin-top: 6px; border: 1px solid #ccc; border-radius: 8px; font-size: 15px; }
  textarea { min-height: 120px; resize: vertical; font-family: inherit; }
  .stars { display:flex; gap: 8px; margin-top: 6px; }
  .stars label { margin: 0; font-weight: normal; display:flex; align-items:center; gap:4px; }
  button { margin-top: 24px; background:#2563eb; color:#fff; border:none; padding: 12px 24px; border-radius: 8px; font-size: 15px; cursor:pointer; }
  button:hover { background:#1d4ed8; }
  .thanks { text-align:center; }
  table { width:100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
  th, td { text-align:left; padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  th { color:#666; font-weight: 600; }
  .score { font-weight:bold; }
  .empty { color:#888; padding: 24px 0; }
  .err { color:#c0392b; margin-top:12px; }
  a { color:#2563eb; }
</style>
</head>
<body>
<div class="wrap">
${body}
</div>
</body>
</html>`;
}

function formPage(error) {
  const stars = [1, 2, 3, 4, 5]
    .map(
      (n) =>
        `<label><input type="radio" name="satisfaction" value="${n}" required>${n}</label>`
    )
    .join("");
  return page(
    "講座の感想アンケート",
    `<h1>講座の感想アンケート</h1>
<p>講座にご参加いただきありがとうございました。今後の参考にさせていただきますので、感想をお聞かせください。</p>
${error ? `<p class="err">${escapeHtml(error)}</p>` : ""}
<form method="POST" action="/submit">
  <label for="nickname">ニックネーム</label>
  <input type="text" id="nickname" name="nickname" maxlength="50" required>

  <label>満足度</label>
  <div class="stars">${stars}</div>

  <label for="comment">自由記述（感想・ご意見など）</label>
  <textarea id="comment" name="comment" maxlength="2000"></textarea>

  <button type="submit">送信する</button>
</form>`
  );
}

function thanksPage() {
  return page(
    "送信完了",
    `<div class="thanks">
<h1>受け付けました</h1>
<p>ご回答ありがとうございました。</p>
</div>`
  );
}

function loginPage(error) {
  return page(
    "管理画面ログイン",
    `<h1>管理画面</h1>
${error ? `<p class="err">${escapeHtml(error)}</p>` : ""}
<form method="POST" action="/admin/login">
  <label for="password">合言葉</label>
  <input type="text" id="password" name="password" required>
  <button type="submit">開く</button>
</form>`
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

async function adminListPage(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, nickname, satisfaction, comment, created_at FROM responses ORDER BY id DESC"
  ).all();

  const rows =
    results.length === 0
      ? `<p class="empty">まだ回答がありません。</p>`
      : `<table>
<thead><tr><th>日時</th><th>ニックネーム</th><th>満足度</th><th>感想</th></tr></thead>
<tbody>
${results
  .map(
    (r) => `<tr>
  <td>${escapeHtml(r.created_at)}</td>
  <td>${escapeHtml(r.nickname)}</td>
  <td class="score">${escapeHtml(r.satisfaction)} / 5</td>
  <td>${escapeHtml(r.comment || "").replace(/\n/g, "<br>")}</td>
</tr>`
  )
  .join("\n")}
</tbody>
</table>`;

  return page(
    "アンケート回答一覧",
    `<h1>アンケート回答一覧（${results.length}件）</h1>
<p><a href="/admin/logout">ログアウト</a></p>
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
      const satisfaction = parseInt(form.get("satisfaction"), 10);
      const comment = (form.get("comment") || "").toString().trim();

      if (!nickname || !(satisfaction >= 1 && satisfaction <= 5)) {
        return new Response(formPage("ニックネームと満足度は必須です。"), {
          status: 400,
          headers: { "content-type": "text/html; charset=UTF-8" },
        });
      }

      await env.DB.prepare(
        "INSERT INTO responses (nickname, satisfaction, comment) VALUES (?, ?, ?)"
      )
        .bind(nickname, satisfaction, comment)
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
