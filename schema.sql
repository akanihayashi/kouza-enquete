-- 初回セットアップ用（まっさらなデータベースにこれを1回実行すれば、現在の形が出来上がります）。
-- 既に稼働中のデータベースを更新する場合は、代わりに migrations/ の中のファイルを順番に実行してください。
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  menu TEXT,
  rating_result INTEGER NOT NULL,
  rating_staff INTEGER,
  rating_explanation INTEGER,
  rating_ambience INTEGER,
  rating_revisit INTEGER,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
