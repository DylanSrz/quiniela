import { readFileSync, writeFileSync } from "node:fs";

const preds = JSON.parse(readFileSync("pronosticos_dylan.json", "utf8"));
const json = JSON.stringify(
  preds.map((p) => ({
    match_id: p.match_id,
    pred_home: p.pred_home,
    pred_away: p.pred_away,
  }))
);

const sql = `with p as (
  insert into participants (display_name, avatar_emoji)
  values ('Dylan', '🎯')
  on conflict (display_name) do update set avatar_emoji = excluded.avatar_emoji
  returning id
)
insert into predictions (participant_id, match_id, pred_home, pred_away)
select p.id, x.match_id, x.pred_home, x.pred_away
from p, jsonb_to_recordset($j$${json}$j$::jsonb)
  as x(match_id int, pred_home int, pred_away int)
on conflict (participant_id, match_id)
  do update set pred_home = excluded.pred_home, pred_away = excluded.pred_away;`;

writeFileSync("scripts/seed-dylan.sql", sql, "utf8");
console.log("OK: scripts/seed-dylan.sql (" + preds.length + " pronosticos)");
