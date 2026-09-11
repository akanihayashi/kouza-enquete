-- 施術後アンケートへの改修。既存の回答（nickname / satisfaction / comment / created_at）は保持し、
-- satisfaction を rating_result に改名したうえで、新しい項目を追加する。
ALTER TABLE responses RENAME COLUMN satisfaction TO rating_result;
ALTER TABLE responses ADD COLUMN menu TEXT;
ALTER TABLE responses ADD COLUMN rating_staff INTEGER;
ALTER TABLE responses ADD COLUMN rating_explanation INTEGER;
ALTER TABLE responses ADD COLUMN rating_ambience INTEGER;
ALTER TABLE responses ADD COLUMN rating_revisit INTEGER;
