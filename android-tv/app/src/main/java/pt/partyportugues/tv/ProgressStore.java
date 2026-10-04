package pt.partyportugues.tv;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/** Small durable snapshots, written on each answer and when the Activity loses focus. */
final class ProgressStore {
    final SharedPreferences prefs;
    JSONObject evidence;
    ProgressStore(Context context) {
        prefs = context.getSharedPreferences("native-learning-v1", Context.MODE_PRIVATE);
        try { evidence = new JSONObject(prefs.getString("evidence", "{}")); }
        catch (Exception e) { evidence = new JSONObject(); }
    }
    boolean known(String id) { return evidence.optInt(id, 0) > 0; }
    boolean missed(String id) { return evidence.optInt(id, 0) < 0; }
    int learned(Catalog.Lesson l) {
        int count = 0; for (StudySession.Card c : l.cards) if (known(c.id)) count++; return count;
    }
    void record(String id, boolean correct) {
        try { evidence.put(id, correct ? 1 : -1); } catch (Exception ignored) { }
    }
    void save(StudySession s) {
        SharedPreferences.Editor edit = prefs.edit().putString("evidence", evidence.toString());
        if (s == null) edit.remove("session");
        else try {
            JSONObject o = new JSONObject(); JSONArray ids = new JSONArray(), misses = new JSONArray();
            for (StudySession.Card c : s.deck) ids.put(c.id);
            for (StudySession.Card c : s.missed) misses.put(c.id);
            o.put("mode", s.mode).put("lesson", s.lessonId).put("seed", s.seed).put("deck", ids)
                .put("missed", misses).put("index", s.index).put("correct", s.correct)
                .put("selected", s.selected).put("firstCount", s.firstCount)
                .put("reviewBuilt", s.reviewBuilt).put("phase", s.phase.name()).put("players", s.players);
            edit.putString("session", o.toString());
        } catch (Exception ignored) { edit.remove("session"); }
        edit.apply();
    }
    StudySession restore(Catalog catalog) {
        try {
            String value = prefs.getString("session", ""); if (value.isEmpty()) return null;
            JSONObject o = new JSONObject(value); List<StudySession.Card> deck = new ArrayList<>();
            JSONArray ids = o.getJSONArray("deck");
            for (int i = 0; i < ids.length(); i++) {
                StudySession.Card c = catalog.cards.get(ids.getString(i)); if (c == null) return null; deck.add(c);
            }
            int firstCount = o.getInt("firstCount");
            if (firstCount < 1 || firstCount > deck.size() || deck.size() > 16) return null;
            StudySession s = new StudySession(o.getString("mode"), o.getString("lesson"), deck,
                o.getLong("seed"), firstCount);
            s.index = o.getInt("index"); s.correct = o.getInt("correct"); s.selected = o.getInt("selected");
            s.reviewBuilt = o.getBoolean("reviewBuilt"); s.phase = StudySession.Phase.valueOf(o.getString("phase"));
            s.players = o.optInt("players", 1) == 2 ? 2 : 1;
            if (s.index < 0 || s.index > deck.size() || (s.index == deck.size() && s.phase != StudySession.Phase.RESULT)) return null;
            JSONArray missed = o.getJSONArray("missed");
            for (int i = 0; i < missed.length(); i++) {
                StudySession.Card c = catalog.cards.get(missed.getString(i)); if (c != null) s.missed.add(c);
            }
            return s;
        } catch (Exception e) { return null; }
    }
}
