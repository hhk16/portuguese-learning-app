package pt.partyportugues.tv;

import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class Catalog {
    static final class Unit {
        String id, title, subtitle, label;
    }
    static final class Lesson {
        String id, unit, title;
        final List<StudySession.Card> cards = new ArrayList<>();
    }
    static final class Topic {
        String id, title, goal, art;
        final List<StudySession.Card> cards = new ArrayList<>();
    }
    final List<Topic> worlds = new ArrayList<>();
    final List<Topic> topics = new ArrayList<>();
    final List<Unit> units = new ArrayList<>();
    final List<Lesson> lessons = new ArrayList<>();
    final Map<String, StudySession.Card> cards = new LinkedHashMap<>();
    final Map<String, List<StudySession.Card>> games = new LinkedHashMap<>();

    static Catalog load(Context context) throws Exception {
        JSONObject data;
        try (InputStream in = context.getAssets().open("curriculum.json")) {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192]; int count;
            while ((count = in.read(buffer)) != -1) bytes.write(buffer, 0, count);
            data = new JSONObject(bytes.toString(StandardCharsets.UTF_8.name()));
        }
        Catalog c = new Catalog();
        JSONArray units = data.getJSONArray("units");
        for (int i = 0; i < units.length(); i++) {
            JSONObject o = units.getJSONObject(i); Unit u = new Unit();
            u.id = o.getString("id"); u.title = o.getString("title");
            u.label = o.getString("short"); u.subtitle = o.getString("en"); c.units.add(u);
        }
        JSONArray lessons = data.getJSONArray("lessons");
        for (int i = 0; i < lessons.length(); i++) {
            JSONObject o = lessons.getJSONObject(i); Lesson l = new Lesson();
            l.id = o.getString("id"); l.unit = o.getString("unit"); l.title = o.getString("title");
            JSONArray cs = o.getJSONArray("cards");
            for (int j = 0; j < cs.length(); j++) {
                JSONObject x = cs.getJSONObject(j); List<String> options = new ArrayList<>();
                JSONArray opts = x.getJSONArray("options");
                for (int k = 0; k < opts.length(); k++) options.add(opts.getString(k));
                StudySession.Card card = new StudySession.Card(x.getString("id"), x.getString("kind"),
                    x.getString("pt"), x.getString("en"), x.getString("prompt"), x.getString("answer"),
                    x.getString("why"), x.isNull("audio") ? "" : x.getString("audio"), options);
                card.art = x.optString("art", ""); card.context = x.optString("context", "");
                l.cards.add(card); c.cards.put(card.id, card);
            }
            c.lessons.add(l);
        }
        JSONArray games = data.getJSONArray("games");
        for (int i = 0; i < games.length(); i++) {
            JSONObject game = games.getJSONObject(i); List<StudySession.Card> deck = new ArrayList<>();
            JSONArray cs = game.getJSONArray("cards");
            for (int j = 0; j < cs.length(); j++) {
                JSONObject x = cs.getJSONObject(j); List<String> opts = new ArrayList<>();
                JSONArray os = x.getJSONArray("options");
                for (int k = 0; k < os.length(); k++) opts.add(os.getString(k));
                StudySession.Card card = new StudySession.Card(x.getString("id"), x.getString("kind"),
                    x.getString("pt"), x.getString("en"), x.getString("prompt"), x.getString("answer"),
                    x.getString("why"), x.isNull("audio") ? "" : x.getString("audio"), opts);
                card.art = x.optString("art", "");
                deck.add(card); c.cards.put(card.id, card);
            }
            c.games.put(game.getString("id"), deck);
        }
        JSONArray topics = data.optJSONArray("phrasebook");
        if (topics != null) for (int i = 0; i < topics.length(); i++) {
            JSONObject o = topics.getJSONObject(i); Topic t = new Topic();
            t.id = o.getString("id"); t.title = o.getString("title"); t.goal = o.getString("goal"); t.art = o.getString("art");
            JSONArray cs = o.getJSONArray("cards");
            for (int j = 0; j < cs.length(); j++) {
                JSONObject x = cs.getJSONObject(j); List<String> opts = new ArrayList<>();
                JSONArray os = x.getJSONArray("options"); for (int k = 0; k < os.length(); k++) opts.add(os.getString(k));
                StudySession.Card card = new StudySession.Card(x.getString("id"), "phrase", x.getString("pt"),
                    x.getString("en"), x.getString("pt"), x.getString("en"), x.getString("tip"), x.getString("audio"), opts);
                card.art = t.art; card.context = x.getString("situation"); t.cards.add(card); c.cards.put(card.id, card);
            }
            c.topics.add(t);
        }
        JSONArray worlds = data.optJSONArray("worlds");
        if (worlds != null) for (int i = 0; i < worlds.length(); i++) {
            JSONObject o = worlds.getJSONObject(i); Topic t = new Topic();
            t.id = o.getString("id"); t.title = o.getString("title"); t.goal = o.getString("goal"); t.art = o.getString("art");
            JSONArray ids = o.getJSONArray("cardIds");
            for (int j = 0; j < ids.length(); j++) t.cards.add(c.cards.get(ids.getString(j)));
            c.worlds.add(t);
        }
        return c;
    }
    Lesson lesson(String id) {
        for (Lesson l : lessons) if (l.id.equals(id)) return l;
        return null;
    }
}
