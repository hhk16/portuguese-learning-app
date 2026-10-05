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
    JSONObject evidence, schedule, favourites;
    ProgressStore(Context context) {
        prefs = context.getSharedPreferences("native-learning-v1", Context.MODE_PRIVATE);
        try { evidence = new JSONObject(prefs.getString("evidence", "{}")); }
        catch (Exception e) { evidence = new JSONObject(); }
        try { schedule = new JSONObject(prefs.getString("schedule", "{}")); } catch (Exception e) { schedule = new JSONObject(); }
        try { favourites = new JSONObject(prefs.getString("favourites", "{}")); } catch (Exception e) { favourites = new JSONObject(); }
    }
    boolean known(String id) { return evidence.optInt(id, 0) > 0; }
    boolean missed(String id) { return evidence.optInt(id, 0) < 0; }
    boolean due(String id) {
        if (missed(id)) return true;
        if (!known(id)) return false;
        JSONObject item = schedule.optJSONObject(id);
        return item == null || item.optLong("due", 0) <= System.currentTimeMillis();
    }
    boolean favourite(String id) { return favourites.optBoolean(id, false); }
    void toggleFavourite(String id) {
        try { if (favourite(id)) favourites.remove(id); else favourites.put(id, true); } catch (Exception ignored) { }
        prefs.edit().putString("favourites", favourites.toString()).apply();
    }
    int learned(Catalog.Lesson l) {
        int count = 0; for (StudySession.Card c : l.cards) if (known(c.id)) count++; return count;
    }
    void record(String id, boolean correct) {
        try {
            long now = System.currentTimeMillis(); JSONObject old = schedule.optJSONObject(id);
            int stage = ReviewSchedule.nextStage(old == null ? 0 : old.optInt("stage"),
                old == null ? 0 : old.optLong("lastSuccess"), now, correct);
            long last = correct ? now : old == null ? 0 : old.optLong("lastSuccess");
            schedule.put(id, new JSONObject().put("stage", stage).put("due", ReviewSchedule.nextDue(stage, now)).put("lastSuccess", last));
            evidence.put(id, correct ? 1 : -1);
        } catch (Exception ignored) { }
    }
    void save(StudySession s) {
        SharedPreferences.Editor edit = prefs.edit().putString("evidence", evidence.toString()).putString("schedule", schedule.toString());
        if (s == null) edit.remove("session");
        else try {
            JSONObject o = new JSONObject(); JSONArray ids = new JSONArray(), misses = new JSONArray();
            for (StudySession.Card c : s.deck) ids.put(c.id);
            for (StudySession.Card c : s.missed) misses.put(c.id);
            JSONArray tray = new JSONArray(); for (int n : s.tray.snapshot()) tray.put(n);
            o.put("mode", s.mode).put("lesson", s.lessonId).put("seed", s.seed).put("deck", ids)
                .put("missed", misses).put("index", s.index).put("correct", s.correct)
                .put("selected", s.selected).put("firstCount", s.firstCount)
                .put("reviewBuilt", s.reviewBuilt).put("phase", s.phase.name()).put("players", s.players)
                .put("tray", tray).put("assisted", s.assisted).put("assistedCorrect", s.assistedCorrect)
                .put("traySubmitted", s.traySubmitted).put("trayCorrect", s.trayCorrect);
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
            if (firstCount < 1 || firstCount > 8 || firstCount > deck.size() || deck.size() > 16) return null;
            String restoredMode = o.getString("mode");
            // Older café sessions used tray matching; retain their exact question and answer order.
            if (restoredMode.equals("cafe") && !o.has("tray")) restoredMode = "cafe-match";
            StudySession s = new StudySession(restoredMode, o.getString("lesson"), deck,
                o.getLong("seed"), firstCount);
            s.index = o.getInt("index"); s.correct = o.getInt("correct"); s.selected = o.getInt("selected");
            s.reviewBuilt = o.getBoolean("reviewBuilt"); s.phase = StudySession.Phase.valueOf(o.getString("phase"));
            s.players = o.optInt("players", 1) == 2 ? 2 : 1;
            JSONArray savedTray = o.optJSONArray("tray");
            if (savedTray != null) {
                int[] counts = new int[savedTray.length()];
                for (int i = 0; i < counts.length; i++) counts[i] = savedTray.getInt(i);
                s.tray = CafeOrder.restore(counts);
            }
            s.assisted = o.optBoolean("assisted"); s.assistedCorrect = o.optInt("assistedCorrect");
            s.traySubmitted = o.optBoolean("traySubmitted"); s.trayCorrect = o.optBoolean("trayCorrect");
            if (s.index < 0 || s.index > deck.size() || (s.index == deck.size() && s.phase != StudySession.Phase.RESULT)) return null;
            if (s.correct < 0 || s.correct > firstCount || s.selected < -1 || s.selected >= s.options().size()) return null;
            if (s.assistedCorrect < 0 || s.assistedCorrect > firstCount) return null;
            if (s.traySubmitted && (!s.mode.equals("cafe") || s.phase != StudySession.Phase.FEEDBACK
                || s.trayCorrect != s.tray.matches(s.card().answer))) return null;
            JSONArray missed = o.getJSONArray("missed");
            for (int i = 0; i < missed.length(); i++) {
                StudySession.Card c = catalog.cards.get(missed.getString(i)); if (c != null) s.missed.add(c);
            }
            return s;
        } catch (Exception e) { return null; }
    }
}
