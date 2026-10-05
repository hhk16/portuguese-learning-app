package pt.partyportugues.tv;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.StateListDrawable;
import android.os.Bundle;
import android.os.SystemClock;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.TextView;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Native, remote-first TV surface. Android owns layout and directional focus. */
public final class MainActivity extends Activity {
    private static final int BG = Color.rgb(255, 248, 231), PANEL = Color.rgb(255, 253, 248),
        INK = Color.rgb(21, 38, 92), MUTED = Color.rgb(93, 109, 139),
        ACCENT = Color.rgb(20, 102, 245), GOLD = Color.rgb(188, 96, 33),
        BLUE = Color.rgb(222, 240, 255), PEACH = Color.rgb(255, 225, 213),
        MINT = Color.rgb(216, 242, 220), LILAC = Color.rgb(236, 229, 255);
    private Catalog catalog;
    private ProgressStore progress;
    private Speech speech;
    private Artwork art;
    private Typeface regular = Typeface.create("sans-serif", Typeface.NORMAL), heavy;
    private StudySession session;
    private String screen = "home", unitId = "", lessonId = "", gameId = "dialogue";
    private String topicId = "greetings", worldId = "snacks";
    private String conversationId = "meeting";
    private ScrollView contentScroll;
    private final java.util.Map<String, String> savedFocus = new java.util.HashMap<>();
    private final java.util.Map<String, Integer> savedScroll = new java.util.HashMap<>();
    private int phraseIndex;
    private LinearLayout root, body;
    private TextView footer;
    private Button audioControl;
    private String audioRestLabel = "▶  Listen again";
    private AlertDialog modal;
    private View firstAction;
    private boolean backgrounded;
    private long lastArrow;
    private int densityPadding = 28;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        setVolumeControlStream(android.media.AudioManager.STREAM_MUSIC);
        progress = new ProgressStore(this); speech = new Speech(this);
        speech.onStateChanged(() -> {
            if (audioControl != null) audioControl.setText(speech.isPlaying() ? "♪  Playing…" : audioRestLabel);
        });
        heavy = Typeface.create(regular, Typeface.BOLD);
        try {
            regular = Typeface.createFromAsset(getAssets(), "art/fonts/nunito.ttf");
            heavy = Typeface.createFromAsset(getAssets(), "art/fonts/nunito-bold.ttf");
        } catch (Exception ignored) { }
        if (state != null) {
            screen = state.getString("screen", "home"); unitId = state.getString("unit", "");
            lessonId = state.getString("lesson", ""); gameId = state.getString("game", "dialogue");
            worldId = state.getString("world", "snacks"); topicId = state.getString("topic", "greetings"); phraseIndex = state.getInt("phrase", 0);
            conversationId = state.getString("conversation", "meeting");
        }
        showLoading();
        // Parse the local catalogue away from the UI thread; even first launch is offline.
        new Thread(() -> {
            try {
                Catalog loaded = Catalog.load(this);
                Artwork pictures = new Artwork(this);
                runOnUiThread(() -> {
                    if (isFinishing() || isDestroyed()) return;
                    catalog = loaded; art = pictures; session = progress.restore(catalog);
                    // A cold launch offers Resume; Activity recreation returns to the same question.
                    if (screen.equals("session") && session == null) screen = "home";
                    draw(null);
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    if (isFinishing() || isDestroyed()) return;
                    showLoading(); ((TextView) root.getChildAt(0)).setText("The lesson library could not load.\nReinstall the app to restore the bundled lessons.");
                });
            }
        }, "curriculum-loader").start();
    }

    private int dp(float n) { return Math.round(n * getResources().getDisplayMetrics().density); }
    private LinearLayout column() { LinearLayout l = new LinearLayout(this); l.setOrientation(LinearLayout.VERTICAL); return l; }
    private LinearLayout row() { LinearLayout l = new LinearLayout(this); l.setOrientation(LinearLayout.HORIZONTAL); return l; }
    private TextView text(String value, int size, int color) {
        TextView t = new TextView(this); t.setText(value); t.setTextSize(size); t.setTextColor(color);
        t.setTypeface(regular); t.setIncludeFontPadding(false); t.setFontFeatureSettings("kern"); t.setPadding(0, dp(2), 0, dp(2)); return t;
    }
    private void title(String value, String subtitle) {
        TextView h = text(value, 28, INK); h.setTypeface(heavy); body.addView(h);
        if (!subtitle.isEmpty()) body.addView(text(subtitle, 17, MUTED));
        space(body, 8);
    }
    private void space(LinearLayout parent, int height) { View v = new View(this); parent.addView(v, new LinearLayout.LayoutParams(1, dp(height))); }
    private GradientDrawable shape(int fill, int stroke) {
        GradientDrawable d = new GradientDrawable(); d.setColor(fill); d.setCornerRadius(dp(12));
        d.setStroke(dp(2), stroke); return d;
    }
    private Button button(String key, String label, Runnable click) {
        Button b = new Button(this); b.setTag(key); b.setId(View.generateViewId()); b.setText(label);
        b.setTypeface(heavy); b.setIncludeFontPadding(false); b.setAllCaps(false); b.setTextSize(18); b.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
        b.setMinHeight(dp(46)); b.setMinimumHeight(dp(46)); b.setPadding(dp(16), dp(7), dp(16), dp(7));
        b.setStateListAnimator(null); b.setMaxLines(4); b.setEllipsize(TextUtils.TruncateAt.END);
        StateListDrawable bg = new StateListDrawable();
        bg.addState(new int[]{android.R.attr.state_focused}, shape(BLUE, ACCENT));
        bg.addState(new int[]{android.R.attr.state_pressed}, shape(BLUE, ACCENT));
        bg.addState(new int[]{}, shape(PANEL, Color.rgb(232, 226, 214))); b.setBackground(bg);
        b.setTextColor(INK);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2); lp.setMargins(dp(2), dp(4), dp(2), dp(6)); b.setLayoutParams(lp);
        b.setOnClickListener(v -> click.run()); b.setFocusable(true);
        if (firstAction == null) firstAction = b;
        if (key.equals("listen")) { audioControl = b; audioRestLabel = label; b.setText(speech.isPlaying() ? "♪  Playing…" : label); }
        return b;
    }
    private Button primary(String key, String label, Runnable action) {
        Button b = button(key, label, action); StateListDrawable states = new StateListDrawable();
        states.addState(new int[]{android.R.attr.state_focused}, shape(ACCENT, INK));
        states.addState(new int[]{}, shape(ACCENT, ACCENT)); b.setBackground(states); b.setTextColor(Color.WHITE); return b;
    }
    private void heading(LinearLayout parent, String value, int size) {
        TextView t = text(value, size, INK); t.setTypeface(heavy); parent.addView(t);
    }
    private void eyebrow(LinearLayout parent, String value) {
        TextView t = text(value, 12, GOLD); t.setTypeface(heavy); t.setLetterSpacing(.1f); parent.addView(t);
    }
    private LinearLayout split(LinearLayout parent, LinearLayout left, LinearLayout right, float weight) {
        LinearLayout r = row();
        LinearLayout.LayoutParams a = new LinearLayout.LayoutParams(0, -2, weight); a.setMargins(0, 0, dp(20), 0);
        r.addView(left, a); r.addView(right, new LinearLayout.LayoutParams(0, -2, 1 - weight)); parent.addView(r); return r;
    }
    private void picture(LinearLayout parent, String asset, int height, boolean character) {
        View v = character ? art.character(this, asset) : art.scene(this, asset);
        parent.addView(v, new LinearLayout.LayoutParams(-1, dp(height)));
    }
    private LinearLayout tile(String key, String name, String description, int fill, Runnable action) {
        LinearLayout card = column(); card.setPadding(dp(14), dp(10), dp(14), dp(10));
        StateListDrawable states = new StateListDrawable();
        states.addState(new int[]{android.R.attr.state_focused}, shape(fill, ACCENT));
        states.addState(new int[]{android.R.attr.state_pressed}, shape(fill, ACCENT));
        states.addState(new int[]{}, shape(fill, fill)); card.setBackground(states);
        card.setTag(key); card.setId(View.generateViewId()); card.setFocusable(true); card.setClickable(true);
        card.setContentDescription(name + ". " + description); card.setOnClickListener(v -> action.run());
        if (firstAction == null) firstAction = card;
        return card;
    }
    private void cardText(LinearLayout card, String name, String description) {
        heading(card, name, 19); if (!description.isEmpty()) card.addView(text(description, 14, MUTED));
    }
    private void threeCards(LinearLayout parent, View... cards) {
        LinearLayout r = row(); for (View v : cards) {
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMargins(0, dp(6), dp(10), dp(6)); r.addView(v, lp);
        } parent.addView(r);
    }
    private String learner() { return progress.prefs.getBoolean("anna", false) ? "ana" : "hadi"; }
    private String player() { return session != null && session.players == 2 ? (session.index % 2 == 0 ? "hadi" : "ana") : learner(); }
    private void add(String key, String label, Runnable action) { body.addView(button(key, label, action)); }
    private void pair(String aKey, String aText, Runnable a, String bKey, String bText, Runnable b) {
        LinearLayout r = row(); Button left = button(aKey, aText, a), right = button(bKey, bText, b);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMargins(dp(2), dp(4), dp(6), dp(6));
        r.addView(left, lp); LinearLayout.LayoutParams rp = new LinearLayout.LayoutParams(0, -2, 1); rp.setMargins(dp(6), dp(4), dp(2), dp(6));
        r.addView(right, rp); body.addView(r);
    }
    private void showLoading() {
        root = column(); root.setGravity(Gravity.CENTER); root.setPadding(dp(36), dp(36), dp(36), dp(36)); root.setBackgroundColor(BG);
        root.addView(text("Party Português\nOpening your lesson library…", 28, INK)); setContentView(root);
    }
    private String navGroup() {
        if (screen.equals("phrase")) return "phrasebook";
        if (screen.equals("units") || screen.equals("lessons") || screen.equals("lesson")) return "units";
        if (screen.equals("games") || screen.equals("intro") || screen.equals("worlds") || screen.equals("world") || screen.equals("conversations") || screen.equals("listening")) return "games";
        return screen;
    }
    private void draw(String focusKey) {
        if (catalog == null || art == null) return;
        firstAction = null; audioControl = null; boolean inSession = screen.equals("session") && session != null;
        getWindow().setFlags(inSession || (screen.equals("phrase") || screen.equals("world")) ? WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON : 0, WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        root = column(); root.setBackgroundColor(BG);
        densityPadding = progress.prefs.getBoolean("safeArea", true) ? 26 : 16;
        root.setPadding(dp(densityPadding), dp(12), dp(densityPadding), dp(10));
        LinearLayout header = row(); header.setGravity(Gravity.CENTER_VERTICAL);
        TextView brand = text("❖  Português", 23, INK); brand.setTypeface(heavy);
        header.addView(brand, new LinearLayout.LayoutParams(0, dp(46), 1.45f));
        if (inSession) {
            TextView activityName = text(session.mode.equals("learn") ? "Your lesson" : gameTitle(session.mode), 18, MUTED);
            header.addView(activityName, new LinearLayout.LayoutParams(0, -2, 2));
            Button pause = button("pause-session", "Pause", this::pause);
            header.addView(pause, new LinearLayout.LayoutParams(dp(110), dp(40)));
        } else {
        String[] ids = {"home", "units", "games", "phrasebook", "progress", "settings"};
        String[] names = {"Home", "Lessons", "Play", "Phrases", "Progress", "Settings"};
        for (int i = 0; i < ids.length; i++) {
            final String dest = ids[i]; Button nav = button("nav-" + dest, names[i], () -> navigate(dest));
            nav.setGravity(Gravity.CENTER); nav.setTextSize(15); nav.setPadding(dp(4), 0, dp(4), 0);
            if ((inSession && dest.equals(session.mode.equals("learn") ? "units" : "games")) || navGroup().equals(dest)) {
                StateListDrawable states = new StateListDrawable();
                states.addState(new int[]{android.R.attr.state_focused}, shape(ACCENT, INK));
                states.addState(new int[]{}, shape(ACCENT, ACCENT)); nav.setBackground(states); nav.setTextColor(Color.WHITE);
            }
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(36), .7f); lp.setMargins(dp(4), 0, dp(4), 0); header.addView(nav, lp);
        }
        }
        root.addView(header); space(root, 9); firstAction = null;
        ScrollView scroll = new ScrollView(this); scroll.setFillViewport(true); scroll.setClipToPadding(false);
        contentScroll = scroll;
        scroll.setVerticalScrollBarEnabled(false); scroll.setFocusable(false); scroll.setDescendantFocusability(ViewGroup.FOCUS_AFTER_DESCENDANTS);
        root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
        body = column(); body.setPadding(dp(3), 0, dp(3), dp(6)); scroll.addView(body);
        footer = text("↔  Arrows  Move       OK  Choose       ↶  Back  Return", 12, MUTED); root.addView(footer);
        switch (screen) {
            case "units": units(); break;
            case "lessons": lessons(); break;
            case "lesson": lesson(); break;
            case "games": games(); break;
            case "worlds": worlds(); break;
            case "world": world(); break;
            case "conversations": conversations(); break;
            case "listening": listeningTopics(); break;
            case "intro": introduction(); break;
            case "progress": stats(); break;
            case "settings": settings(); break;
            case "phrasebook": phrasebook(); break;
            case "phrase": phrase(); break;
            case "session": if (session != null) study(); else home(); break;
            default: home();
        }
        setContentView(root);
        View target = focusKey == null ? firstAction : root.findViewWithTag(focusKey);
        if (target == null) target = firstAction;
        if (target != null) target.requestFocus();
    }
    private String pageKey() {
        switch (screen) {
            case "lessons": return screen + unitId;
            case "lesson": return screen + lessonId;
            case "phrase": return screen + topicId;
            case "world": return screen + worldId;
            case "intro": return screen + gameId + topicId + conversationId;
            default: return screen;
        }
    }
    private void navigate(String destination) {
        View focused = getCurrentFocus();
        if (focused != null && focused.getTag() instanceof String) savedFocus.put(pageKey(), (String) focused.getTag());
        if (contentScroll != null) savedScroll.put(pageKey(), contentScroll.getScrollY());
        speech.stop(); screen = destination; String key = pageKey(); draw(savedFocus.get(key));
        if (savedScroll.containsKey(key)) { ScrollView target = contentScroll; int offset = savedScroll.get(key); target.post(() -> target.scrollTo(0, offset)); }
    }
    private void home() {
        Catalog.Lesson next = catalog.lessons.get(0);
        for (Catalog.Lesson l : catalog.lessons) if (progress.learned(l) < l.cards.size()) { next = l; break; }
        final Catalog.Lesson chosen = next;
        LinearLayout copy = column(), scene = column();
        eyebrow(copy, "YOUR NEXT LEARNING GOAL");
        TextView goal = text(chosen.goal, 28, INK); goal.setTypeface(heavy); goal.setMaxLines(2); goal.setEllipsize(TextUtils.TruncateAt.END); copy.addView(goal);
        space(copy, 4);
        if (session != null && session.phase != StudySession.Phase.RESULT) {
            copy.addView(primary("resume", "Resume " + (session.mode.equals("learn") ? "your lesson" : gameTitle(session.mode)) + "  →", () -> { screen = "session"; draw(null); }));
            copy.addView(button("next-lesson", "Explore this lesson", () -> { lessonId = chosen.id; unitId = chosen.unit; navigate("lesson"); }));
        } else copy.addView(primary("next-lesson", "Continue learning  →", () -> { lessonId = chosen.id; unitId = chosen.unit; navigate("lesson"); }));
        copy.addView(text(chosen.title, 13, MUTED));
        copy.addView(text(progress.learned(chosen) + " / " + chosen.cards.size() + " items practised correctly", 12, MUTED));
        progressBar(copy, progress.learned(chosen), chosen.cards.size());
        copy.addView(button("cafe-journey", "Try a café adventure  →", () -> intro("cafe")));
        picture(scene, "home", 228, false); split(body, copy, scene, .43f);
        space(body, 8); heading(body, "Make yourself at home", 22);
        LinearLayout learn = tile("browse", "Picture worlds", "Four words at a time", BLUE, () -> navigate("worlds"));
        miniCard(learn, "picture", "Picture worlds", "See. Hear. Remember.");
        LinearLayout play = tile("play", "Real-life phrases", "Six illustrated adventures", PEACH, () -> navigate("phrasebook"));
        miniCard(play, "together", "Real-life phrases", "Listen. Save. Try it.");
        int misses = 0; for (String id : catalog.cards.keySet()) if (progress.due(id)) misses++;
        final boolean ready = misses > 0;
        LinearLayout review = tile("home-review", "Daily revision", ready ? misses + " items to revisit" : "Your learning journey", MINT,
            () -> { if (ready) startRevision(); else navigate("progress"); });
        miniCard(review, "review", "Daily revision", ready ? misses + " items ready for revision" : "Your learning journey");
        threeCards(body, learn, play, review);
    }
    private String lessonGoal(Catalog.Lesson lesson) {
        return unitGoal(lesson.unit);
    }
    private String unitGoal(String unit) {
        switch (unit) {
            case "u00": return "Greetings and everyday essentials";
            case "u01": return "Introduce yourself in Portuguese";
            case "u02": return "Talk about family and friends";
            case "u03": return "Food, orders and everyday routines";
            case "u04": return "Find your way around town";
            case "u05": return "Weather, clothes and plans";
            case "u06": return "Explain how you feel";
            case "u07": return "Talk about what happened";
            case "u08": return "Talk about holidays and travel";
            default: return "Bring your Portuguese together";
        }
    }
    private void miniCard(LinearLayout card, String kind, String name, String subtitle) {
        LinearLayout copy = column(), image = column(); cardText(copy, name, subtitle);
        if (kind.equals("picture")) picture(image, "cat", 72, true);
        else if (kind.equals("together")) picture(image, "ana-wave", 72, true);
        else image.addView(art.symbol(this, kind), new LinearLayout.LayoutParams(-1, dp(72)));
        split(card, copy, image, .66f);
    }
    private void startRevision() {
        List<StudySession.Card> deck = new ArrayList<>();
        for (StudySession.Card c : catalog.cards.values()) if (progress.due(c.id)) deck.add(c);
        // Unresolved mistakes come first; otherwise preserve a stable order.
        Collections.sort(deck, (a, b) -> Boolean.compare(progress.missed(b.id), progress.missed(a.id)));
        start("review", "", deck, 1);
    }
    private List<StudySession.Card> phraseCards() {
        List<StudySession.Card> cards = new ArrayList<>();
        if (topicId.equals("saved")) {
            for (StudySession.Card c : catalog.cards.values()) if (progress.favourite(c.id)) cards.add(c);
        } else for (Catalog.Topic t : catalog.topics) if (t.id.equals(topicId)) cards.addAll(t.cards);
        return cards;
    }
    private void phrasebook() {
        title("Portuguese for real life", "");
        int saved = 0, due = 0;
        for (String id : catalog.cards.keySet()) { if (progress.favourite(id)) saved++; if (progress.due(id)) due++; }
        final int savedCount = saved, dueCount = due;
        pair("saved-phrases", "Saved phrases  ·  " + saved, () -> {
            if (savedCount == 0) { notice("Open a phrase and choose Save. Your favourites will appear here."); return; }
            topicId = "saved"; phraseIndex = 0; navigate("phrase");
        }, "daily-revision", "Revision  ·  " + due + " ready", () -> {
            if (dueCount == 0) { notice("Nothing is due yet. Learn a few phrases; they return for revision on later days."); return; }
            startRevision();
        });
        int[] fills = {BLUE, PEACH, MINT, LILAC, BLUE, MINT};
        for (int i = 0; i < catalog.topics.size(); i += 3) {
            LinearLayout r = row();
            for (int j = i; j < Math.min(i + 3, catalog.topics.size()); j++) {
                Catalog.Topic t = catalog.topics.get(j);
                LinearLayout card = tile("topic-" + t.id, t.title, t.goal, fills[j], () -> {
                    topicId = t.id; phraseIndex = 0; navigate("phrase");
                });
                if (j == 0) firstAction = card;
                picture(card, t.art, 90, false); heading(card, t.title, 18);
                card.addView(text(t.goal, 12, MUTED));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(156), 1); lp.setMargins(0, dp(5), dp(9), dp(5)); r.addView(card, lp);
            }
            body.addView(r);
        }
    }
    private void phrase() {
        List<StudySession.Card> cards = phraseCards();
        if (cards.isEmpty()) { phrasebook(); return; }
        phraseIndex = Math.max(0, Math.min(phraseIndex, cards.size() - 1)); StudySession.Card c = cards.get(phraseIndex);
        String topicName = "Your saved words";
        for (Catalog.Topic t : catalog.topics) if (t.id.equals(topicId)) topicName = t.title;
        eyebrow(body, topicName.toUpperCase(java.util.Locale.ROOT) + "  ·  " + (phraseIndex + 1) + " / " + cards.size());
        LinearLayout left = column(), right = column();
        picture(left, c.art.isEmpty() ? "conversation" : c.art, 226, false);
        left.addView(text("Listen. Say it. Imagine using it.", 16, MUTED));
        left.addView(button("practise-topic", "Practise these phrases  →", () -> start("learn", "", cards, 1)));
        heading(right, c.pt, 29); right.addView(text(c.en, 19, MUTED));
        space(right, 7); eyebrow(right, "USE IT WHEN"); right.addView(text(c.context.isEmpty() ? "You want to use this word in a conversation." : c.context, 16, INK));
        LinearLayout tip = column(); tip.setPadding(dp(12), dp(7), dp(12), dp(7)); tip.setBackground(shape(BLUE, BLUE));
        eyebrow(tip, "A LITTLE LANGUAGE TIP"); tip.addView(text(c.why.isEmpty() ? "Listen, then repeat without looking at the words." : c.why, 15, INK)); right.addView(tip);
        LinearLayout sounds = row();
        Button listen = primary("listen", "▶  Listen", () -> speech.play(c.audio, false, () -> notice("This recording could not play.")));
        firstAction = listen;
        Button slower = button("listen-slow", "▶  Slowly", () -> speech.play(c.audio, true, () -> notice("This recording could not play.")));
        sounds.addView(listen, new LinearLayout.LayoutParams(0, -2, 1)); sounds.addView(slower, new LinearLayout.LayoutParams(0, -2, 1)); right.addView(sounds);
        right.addView(button("save-phrase", progress.favourite(c.id) ? "★  Saved · Remove" : "☆  Save this phrase", () -> { progress.toggleFavourite(c.id); draw("save-phrase"); }));
        split(body, left, right, .38f); space(body, 8);
        pair("previous-phrase", "←  Previous", () -> { speech.stop(); phraseIndex = (phraseIndex + cards.size() - 1) % cards.size(); draw("previous-phrase"); },
            "next-phrase", "Next phrase  →", () -> { speech.stop(); phraseIndex = (phraseIndex + 1) % cards.size(); draw("next-phrase"); });
    }
    private void progressBar(LinearLayout parent, int value, int total) {
        ProgressBar bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(total); bar.setProgress(value); bar.setProgressTintList(ColorStateList.valueOf(Color.rgb(43, 159, 107)));
        parent.addView(bar, new LinearLayout.LayoutParams(-1, dp(5)));
    }
    private String sceneForUnit(String id) {
        switch (id) {
            case "u03": return "cafe";
            case "u04": return "station"; case "u08": return "journey";
            case "u02": return "home-life"; case "u05": return "park";
            case "u06": return "pharmacy";
            case "a1": return "market";
            default: return "conversation";
        }
    }
    private void units() {
        title("Everyday Portuguese", "A small adventure, one chapter at a time.");
        footer.setText("Arrows  Move · Down for more chapters     OK  Open     Back  Return");
        List<Catalog.Unit> us = catalog.units;
        for (int i = 0; i < us.size(); i += 3) {
            LinearLayout r = row();
            for (int j = i; j < Math.min(i + 3, us.size()); j++) {
                Catalog.Unit u = us.get(j); int fill = new int[]{BLUE, PEACH, MINT, LILAC}[j % 4];
                LinearLayout card = tile("unit-" + u.id, u.title, u.subtitle, fill, () -> { unitId = u.id; navigate("lessons"); });
                picture(card, sceneForUnit(u.id), 51, false);
                eyebrow(card, u.label); TextView name = text(u.id.startsWith("pds") || u.id.equals("a1") ? u.subtitle : unitGoal(u.id), 18, INK); name.setTypeface(heavy); name.setMaxLines(2); name.setEllipsize(TextUtils.TruncateAt.END); card.addView(name);
                TextView portuguese = text(u.title, 13, MUTED); portuguese.setMaxLines(1); portuguese.setEllipsize(TextUtils.TruncateAt.END); card.addView(portuguese);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(158), 1); lp.setMargins(0, dp(5), dp(10), dp(5)); r.addView(card, lp);
            }
            body.addView(r);
        }
    }
    private void lessons() {
        Catalog.Unit u = null; for (Catalog.Unit item : catalog.units) if (item.id.equals(unitId)) u = item;
        title(u == null ? "Lessons" : unitGoal(u.id), u == null ? "" : u.title);
        int number = 0;
        for (Catalog.Lesson l : catalog.lessons) if (l.unit.equals(unitId)) {
            int n = progress.learned(l); number++;
            LinearLayout card = tile("lesson-" + l.id, l.title, n + " / " + l.cards.size() + " practised", PANEL,
                () -> { lessonId = l.id; navigate("lesson"); });
            eyebrow(card, "LESSON " + number + (n == l.cards.size() ? "  ·  COMPLETED" : ""));
            cardText(card, l.goal, l.title); card.addView(text(n + " / " + l.cards.size() + " practised independently", 13, MUTED)); progressBar(card, n, l.cards.size());
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2); lp.setMargins(0, dp(4), 0, dp(8)); body.addView(card, lp);
        }
    }
    private void lesson() {
        Catalog.Lesson l = catalog.lesson(lessonId); if (l == null) { screen = "units"; units(); return; }
        LinearLayout left = column(), right = column();
        picture(left, sceneForUnit(l.unit), 100, false); picture(left, learner() + "-wave", 125, true);
        eyebrow(right, "YOUR LEARNING GOAL"); heading(right, l.goal, 27); right.addView(text(l.title, 14, MUTED));
        right.addView(text("Up to four items in this short session.", 16, MUTED));
        space(right, 6); step(right, 1, "Meet the whole set", "Read, listen and say the expressions.");
        step(right, 2, "Recall after a gap", "Try them after learning the other items.");
        step(right, 3, "Use what you learned", "Replay your recap. Tricky items return once.");
        right.addView(primary("start-lesson", "Let's learn  →", () -> startLesson(l)));
        split(body, left, right, .31f);
        space(body, 10); eyebrow(body, "A TASTE OF THIS LESSON");
        int count = 0; LinearLayout samples = row();
        for (StudySession.Card c : l.cards) {
            if (count++ == 3) break;
            LinearLayout card = column(); card.setPadding(dp(14), dp(6), dp(14), dp(6)); card.setBackground(shape(PANEL, PANEL));
            heading(card, c.pt, 18); card.addView(text(c.en, 14, MUTED));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMargins(0, 0, dp(10), 0); samples.addView(card, lp);
        } body.addView(samples);
    }
    private void step(LinearLayout parent, int number, String name, String detail) {
        LinearLayout r = row(); r.setGravity(Gravity.CENTER_VERTICAL);
        TextView badge = text(String.valueOf(number), 19, ACCENT); badge.setGravity(Gravity.CENTER); badge.setTypeface(heavy);
        badge.setBackground(shape(BLUE, BLUE)); r.addView(badge, new LinearLayout.LayoutParams(dp(34), dp(34)));
        LinearLayout copy = column(); copy.setPadding(dp(12), 0, 0, dp(5)); heading(copy, name, 18); copy.addView(text(detail, 15, MUTED));
        r.addView(copy, new LinearLayout.LayoutParams(0, -2, 1)); parent.addView(r); space(parent, 5);
    }
    private void startLesson(Catalog.Lesson l) {
        List<StudySession.Card> deck = new ArrayList<>();
        for (StudySession.Card c : l.cards) if (!progress.known(c.id)) deck.add(c);
        if (deck.isEmpty()) deck.addAll(l.cards);
        start("learn", l.id, deck, 1);
    }
    private void games() {
        title("A little adventure. A useful skill.", "Four clear ways to practise. Learn first, then give it a try.");
        String[] ids = {"picture", "cafe", "conversation", "listen"};
        String[] names = {"Picture worlds", "At the café", "Small conversations", "Listen & understand"};
        String[] goals = {"Meet four words. Match the pictures.", "Hear an order. Build a tray. Serve.", "Hear a line. Reply. See what happens.", "Learn a set. Recognise it by listening."};
        String[] scenes = {"park", "cafe", "conversation", "journey"};
        for (int i = 0; i < ids.length; i += 2) {
            LinearLayout r = row();
            for (int j = i; j < i + 2; j++) {
                final String id = ids[j];
                LinearLayout card = tile(id.equals("review") ? "review" : "game-" + id, names[j], goals[j], new int[]{BLUE, PEACH, MINT, LILAC}[j % 4],
                    () -> { if (id.equals("picture")) navigate("worlds"); else if (id.equals("conversation")) navigate("conversations"); else if (id.equals("listen")) navigate("listening"); else intro(id); });
                picture(card, scenes[j], 86, false); heading(card, names[j], 22); card.addView(text(goals[j], 14, MUTED));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(173), 1); lp.setMargins(0, dp(4), dp(10), dp(4)); r.addView(card, lp);
            }
            body.addView(r);
        }
    }
    private void worlds() {
        title("Little worlds. Useful words.", "Choose a place. Meet four words, then match their pictures.");
        for (int i = 0; i < catalog.worlds.size(); i += 2) {
            LinearLayout r = row();
            for (int j = i; j < Math.min(i + 2, catalog.worlds.size()); j++) {
                Catalog.Topic w = catalog.worlds.get(j);
                int known = 0; for (StudySession.Card c : w.cards) if (progress.known(c.id)) known++;
                LinearLayout card = tile("world-" + w.id, w.title, w.goal, new int[]{PEACH, BLUE, MINT, LILAC}[j % 4], () -> { worldId = w.id; navigate("world"); });
                picture(card, w.art, 80, false); heading(card, w.title, 21);
                card.addView(text("4 words  ·  " + known + " / 4 practised", 14, MUTED));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(161), 1); lp.setMargins(0, dp(4), dp(10), dp(4)); r.addView(card, lp);
            }
            body.addView(r);
        }
    }
    private Catalog.Topic selectedConversation() {
        for (Catalog.Topic t : catalog.conversations) if (t.id.equals(conversationId)) return t;
        return catalog.conversations.get(0);
    }
    private Catalog.Topic selectedListeningTopic() {
        for (Catalog.Topic t : catalog.topics) if (t.id.equals(topicId)) return t;
        return catalog.topics.get(0);
    }
    private void conversations() {
        title("A small conversation. A real purpose.", "Choose a scene. Meet your replies before the conversation begins.");
        LinearLayout cards = row();
        for (Catalog.Topic t : catalog.conversations) {
            LinearLayout card = tile("conversation-" + t.id, t.title, t.goal, BLUE, () -> { conversationId = t.id; intro("conversation"); });
            picture(card, t.art, 132, false); heading(card, t.title, 22);
            card.addView(text(t.goal, 16, MUTED)); space(card, 8); eyebrow(card, "3 REPLIES · 3 TURNS · NO TIMER");
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(278), 1); lp.setMargins(0, dp(8), dp(10), 0); cards.addView(card, lp);
        }
        body.addView(cards);
    }
    private void listeningTopics() {
        title("Listen. Recognise. Remember.", "Choose a topic. Learn up to four expressions before listening without the text.");
        for (int i = 0; i < catalog.topics.size(); i += 3) {
            LinearLayout cards = row();
            for (int j = i; j < Math.min(i + 3, catalog.topics.size()); j++) {
                Catalog.Topic t = catalog.topics.get(j);
                LinearLayout card = tile("listen-topic-" + t.id, t.title, t.goal, LILAC, () -> { topicId = t.id; intro("listen"); });
                picture(card, t.art, 70, false); heading(card, t.title, 20);
                card.addView(text("Learn a small set · Listen & choose", 14, MUTED));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(154), 1); lp.setMargins(0, dp(5), dp(10), dp(5)); cards.addView(card, lp);
            }
            body.addView(cards);
        }
    }
    private Catalog.Topic selectedWorld() {
        for (Catalog.Topic w : catalog.worlds) if (w.id.equals(worldId)) return w;
        return catalog.worlds.get(0);
    }
    private void world() {
        Catalog.Topic w = selectedWorld();
        LinearLayout scene = column(), copy = column(); picture(scene, w.art, 142, false);
        eyebrow(copy, "PICTURE WORLDS · FOUR WORDS AT A TIME"); heading(copy, w.title, 30);
        copy.addView(text(w.goal, 17, MUTED)); copy.addView(text("Select a word to hear it. Say it out loud.\nThen learn with help, or try listening without text.", 16, MUTED));
        split(body, scene, copy, .38f); space(body, 7);
        LinearLayout words = row();
        for (StudySession.Card c : w.cards) {
            LinearLayout card = tile("word-" + c.id, c.pt, c.en, PANEL, () -> listen(c));
            picture(card, c.art, 94, true); TextView pt = text(c.pt, 21, INK); pt.setTypeface(heavy); pt.setGravity(Gravity.CENTER); card.addView(pt);
            TextView en = text(c.en, 15, MUTED); en.setGravity(Gravity.CENTER); card.addView(en);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(166), 1); lp.setMargins(0, 0, dp(10), 0); words.addView(card, lp);
        }
        body.addView(words);
        pair("learn-world", "1  Learn these four  →", () -> start("learn", "", w.cards, 1),
            "match-world", "2  Listen & match pictures  →", () -> start("picture", "", w.cards, 1));
        footer.setText("Arrows  Choose a word     OK  Listen     Back  Picture worlds");
    }
    private void intro(String id) { gameId = id; navigate("intro"); }
    private String gameTitle(String id) {
        switch (id) { case "picture": return "Picture worlds"; case "cafe": case "cafe-match": return "At the café"; case "conversation": return "Small conversations"; case "listen": return "Listen & understand";
            case "grammar": return "Build a sentence"; case "review": return "Daily revision";
            default: return "Choose the reply"; }
    }
    private String rules(String id) {
        switch (id) {
            case "picture": return "Listen to the Portuguese word.\nChoose its picture using the arrows and OK.\nLearn the article and noun together after each answer.";
            case "cafe": return "Meet four café words, then try an order with help.\nAdd or remove items with the + and − buttons. Press Serve when ready.\nListen for both the food and the quantities. Try three orders on your own.";
            case "conversation": return "Meet all three replies, with their meaning and audio.\nHear a line. Choose the reply that achieves your goal.\nHear the next line. Mistakes and helped replies return once.";
            case "listen": return "Meet a small set of expressions with text and audio.\nHear an expression without its text. Choose its meaning.\nReplay normally or slowly. Use help and try again later.";
            case "grammar": return "Read the sentence and the hint.\nChoose the word or phrase that fills the gap.\nAfter each answer, see the complete sentence and an explanation.";
            case "review": return "Try the items you missed previously.\nChoose an answer, then read the correction.\nA correct answer removes the item from your review list.";
            default: return "Read the situation and the message you want to say.\nChoose the Portuguese reply that fits that specific situation.\nAfter each answer, see why the reply works.";
        }
    }
    private void introduction() {
        LinearLayout left = column(), right = column();
        String scene = gameId.equals("conversation") ? selectedConversation().art : gameId.equals("listen") ? selectedListeningTopic().art : gameId.equals("cafe") ? "cafe" : "conversation";
        if (gameId.equals("dialogue") || gameId.equals("cafe") || gameId.equals("conversation") || gameId.equals("listen")) picture(left, scene, 224, false);
        else { left.setBackground(shape(gameId.equals("listen") ? LILAC : MINT, PANEL));
            left.addView(art.symbol(this, gameId), new LinearLayout.LayoutParams(-1, dp(96))); picture(left, learner() + "-think", 172, true); }
        left.addView(text("Hadi & Anna · Your Portuguese companions", 13, MUTED));
        eyebrow(right, "THE GOAL"); heading(right, gameId.equals("conversation") ? selectedConversation().title : gameId.equals("listen") ? selectedListeningTopic().title : gameTitle(gameId), 27);
        String[] lines = rules(gameId).split("\n");
        step(right, 1, gameId.equals("cafe") ? "Meet the words" : gameId.equals("listen") ? "Listen" : "Look", lines[0]);
        step(right, 2, gameId.equals("cafe") ? "Build your tray" : "Choose", lines[1]);
        step(right, 3, gameId.equals("cafe") ? "Serve the order" : "Learn", lines[2]);
        String example;
        switch (gameId) {
            case "cafe": example = "Queria dois cafés, por favor. → 2 coffees"; break;
            case "conversation": StudySession.Card sample = selectedConversation().cards.get(0); example = sample.prompt + " → " + sample.pt; break;
            case "listen": StudySession.Card phrase = selectedListeningTopic().cards.get(0); example = "Hear " + phrase.pt + " → " + phrase.en; break;
            case "grammar": example = "Nós ___ portugueses. → somos"; break;
            case "review": example = "A correct answer clears an item from review."; break;
            default: example = "Como te chamas? → O meu nome é Ana.";
        }
        LinearLayout hint = column(); hint.setPadding(dp(12), dp(5), dp(12), dp(5)); hint.setBackground(shape(BLUE, BLUE));
        eyebrow(hint, "FOR EXAMPLE"); hint.addView(text(example, 16, INK)); right.addView(hint);
        eyebrow(right, "CONTROLS · ARROWS + OK · BACK PAUSES");
        right.addView(text("Together: pass the remote after each turn.\nMistakes return once. Progress is shared.", 14, MUTED));
        LinearLayout buttons = row();
        Button solo = primary("solo", (gameId.equals("cafe") || gameId.equals("conversation") || gameId.equals("listen")) ? "Learn this set  →" : "Start revision  →", () -> startGame(1)), together = button("together", "Play together", () -> startGame(2));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMargins(0, dp(4), dp(8), 0);
        buttons.addView(solo, lp); buttons.addView(together, new LinearLayout.LayoutParams(0, -2, 1)); right.addView(buttons);
        split(body, left, right, .34f);
    }
    private List<StudySession.Card> practiceDeck(String mode) {
        if (catalog.games.containsKey(mode)) return new ArrayList<>(catalog.games.get(mode));
        List<StudySession.Card> deck = new ArrayList<>(), backup = new ArrayList<>();
        for (StudySession.Card c : catalog.cards.values()) {
            if (!mode.equals("review") && (c.kind.equals("cafe") || c.kind.equals("dialogue") || c.kind.equals("picture"))) continue;
            boolean eligible = mode.equals("review") ? progress.missed(c.id)
                : mode.equals("grammar") ? c.grammar() : !c.audio.isEmpty() && !c.grammar();
            if (!eligible) continue;
            backup.add(c); if (progress.known(c.id) || progress.missed(c.id)) deck.add(c);
        }
        if (deck.isEmpty()) deck = backup.subList(0, Math.min(24, backup.size()));
        return new ArrayList<>(deck);
    }
    private void startGame(int players) {
        List<StudySession.Card> deck = gameId.equals("conversation") ? new ArrayList<>(selectedConversation().cards)
            : gameId.equals("listen") ? new ArrayList<>(selectedListeningTopic().cards) : practiceDeck(gameId);
        if (gameId.equals("cafe")) {
            // Start with a guided coffee, then quantities and combinations of the four taught foods.
            List<StudySession.Card> starters = new ArrayList<>();
            for (int index : new int[]{0, 1, 2, 5}) starters.add(deck.get(index));
            deck = starters;
        } else if (!gameId.equals("review") && !gameId.equals("conversation") && !gameId.equals("listen")) Collections.shuffle(deck);
        start(gameId, "", deck, players);
    }
    private void start(String mode, String lesson, List<StudySession.Card> deck, int players) {
        if (deck.isEmpty()) { notice("No items are ready for this activity yet. Try a lesson first."); return; }
        Runnable go = () -> {
            speech.stop(); session = new StudySession(mode, lesson, deck.subList(0, Math.min(4, deck.size())), System.nanoTime());
            session.players = players; screen = "session"; progress.save(session); draw(null);
        };
        if (session != null && session.phase != StudySession.Phase.RESULT) {
            modal = new AlertDialog.Builder(this).setTitle("Start a new session?")
                .setMessage("Your saved answers stay. The unfinished session will be replaced.")
                .setPositiveButton("Start new session", (d, w) -> go.run()).setNegativeButton("Keep current session", null).create(); modal.show();
        } else go.run();
    }
    private void study() {
        StudySession s = session; StudySession.Card c = s.card();
        if (s.mode.equals("cafe")) { cafeStudy(); return; }
        boolean audioQuestion = s.mode.equals("listen") || s.mode.equals("picture") || c.kind.equals("cafe") || c.kind.equals("minimalPair");
        if (s.phase == StudySession.Phase.RESULT) { results(); return; }
        String who = player(), name = who.equals("hadi") ? "Hadi" : "Anna";
        String turn = s.players == 2 ? "PLAYER " + (s.index % 2 + 1) + " · " + name + "   ·   " : name + "   ·   ";
        String step = s.index >= s.firstCount ? "RETRY " + (s.index - s.firstCount + 1) + " / " + s.missed.size()
            : (s.phase == StudySession.Phase.TEACH ? "MEET " : "TRY ") + (s.phase == StudySession.Phase.TEACH && s.batchTeaching ? s.teachIndex + 1 : s.index + 1) + " / " + s.firstCount;
        LinearLayout meta = row(); meta.setGravity(Gravity.CENTER_VERTICAL);
        meta.addView(art.character(this, who), new LinearLayout.LayoutParams(dp(32), dp(32)));
        TextView label = text("  " + turn + step + "   ·   " + (s.mode.equals("learn") ? "LEARN" : gameTitle(s.mode).toUpperCase(java.util.Locale.ROOT)), 13, INK);
        label.setTypeface(heavy); meta.addView(label); body.addView(meta);
        progressBar(body, s.phase == StudySession.Phase.TEACH && s.batchTeaching ? s.teachIndex : s.index, s.phase == StudySession.Phase.TEACH ? s.firstCount : s.deck.size()); space(body, 8);
        footer.setText("↔  Arrows  Choose       OK  Answer       ↶  Back  Pause       ▷Ⅱ  Replay audio");
        if (s.phase == StudySession.Phase.TEACH) footer.setText("Arrows  Move     OK  Listen / continue     Back  Pause     ▷Ⅱ  Replay");
        else if (s.phase == StudySession.Phase.FEEDBACK) footer.setText("Arrows  Move     OK  Continue / replay     Back  Pause");
        LinearLayout left = column(), right = column();
        if (c.kind.equals("conversation")) { conversationStudy(); return; }
        if (s.phase == StudySession.Phase.TEACH) {
            left.setBackground(shape(BLUE, BLUE)); picture(left, c.art.isEmpty() ? who + "-wave" : c.art, 212, c.art.isEmpty() || c.kind.equals("noun") || c.kind.equals("picture"));
            eyebrow(right, c.grammar() ? "A SENTENCE YOU CAN USE" : "MEET THIS EXPRESSION"); heading(right, c.pt, 28); right.addView(text(c.en, 18, MUTED));
            if (!c.context.isEmpty()) right.addView(text(c.context, 15, GOLD));
            if (!c.why.isEmpty()) { TextView tip = text(c.why, 15, MUTED); tip.setMaxLines(3); tip.setEllipsize(TextUtils.TruncateAt.END); right.addView(tip);
                right.addView(button("language-tip", "Explain this expression", () -> notice(c.why))); }
            right.addView(text("Listen and say it aloud. Recall comes after the whole set.", 15, GOLD));
            if (!c.audio.isEmpty()) audioPair(right, c.audio, "▶  Listen");
            right.addView(primary("practice", s.batchTeaching && s.teachIndex + 1 < s.firstCount ? "Next expression  →" : "Try this set  →", () -> { speech.stop(); s.practice(); progress.save(s); draw(null); }));
            firstAction = right.findViewWithTag(c.audio.isEmpty() ? "practice" : "listen");
            split(body, left, right, .30f); return;
        }
        if (c.grammar() && s.phase == StudySession.Phase.QUESTION) { grammarStudy(); return; }
        if (s.phase == StudySession.Phase.FEEDBACK) {
            boolean correct = s.wasCorrect(); int colour = correct ? MINT : PEACH;
            left.setBackground(shape(colour, colour));
            if (c.kind.equals("picture")) { picture(left, c.art, 185, true); picture(left, who + (correct ? "-cheer" : "-think"), 63, true); }
            else picture(left, who + (correct ? "-cheer" : "-think"), 248, true);
            eyebrow(right, s.assisted ? "PRACTISED WITH HELP" : s.selected < 0 ? "A LITTLE HELP" : correct ? "NICE WORK, " + name.toUpperCase(java.util.Locale.ROOT) : "A CHANCE TO LEARN");
            heading(right, s.selected < 0 ? "Here is the transcript." : correct ? "That's right." : "Let's try that again.", 29);
            right.addView(text("The answer: " + c.answer, 18, INK));
            LinearLayout explanation = column(); explanation.setPadding(dp(14), dp(9), dp(14), dp(9)); explanation.setBackground(shape(PANEL, PANEL));
            heading(explanation, c.pt, 23);
            if (!c.en.isEmpty() && !c.en.equals(c.answer)) explanation.addView(text(c.en, 17, MUTED));
            if (!c.why.isEmpty()) { TextView tip = text(c.why, 15, MUTED); tip.setMaxLines(3); tip.setEllipsize(TextUtils.TruncateAt.END); explanation.addView(tip); } right.addView(explanation);
            if (!correct && s.selected >= 0) right.addView(text("Your choice: " + s.options().get(s.selected), 14, MUTED));
            if (s.assisted) right.addView(text("You used help. This expression returns once for an independent try.", 14, GOLD));
            else if (s.selected < 0) right.addView(text("This item is saved for revision.", 14, GOLD));
            boolean last = s.index + 1 == s.deck.size() && (s.reviewBuilt || s.missed.isEmpty());
            String next = last ? "See results  →" : s.players == 2 ? "Continue  ·  " + (s.index % 2 == 0 ? "Anna's turn" : "Hadi's turn") : "Continue  →";
            right.addView(primary("continue", next, () -> { speech.stop(); s.next(); progress.save(s); draw(null); }));
            if (!c.audio.isEmpty()) right.addView(button("listen", "▶  Listen to the Portuguese", () -> listen(c)));
            split(body, left, right, .28f); return;
        }
        boolean cafe = c.kind.equals("cafe");
        if (cafe) picture(left, "cafe", 216, false);
        else if (c.kind.equals("picture")) { String scene = "park"; for (Catalog.Topic w : catalog.worlds) if (w.cards.contains(c)) scene = w.art; picture(left, scene, 180, false); }
        else if (c.kind.equals("dialogue")) picture(left, c.art.isEmpty() ? "conversation" : c.art, 216, false);
        else {
            left.setBackground(shape(audioQuestion ? LILAC : MINT, PANEL));
            left.addView(art.symbol(this, audioQuestion ? "listen" : "grammar"), new LinearLayout.LayoutParams(-1, dp(62)));
            picture(left, who + "-think", 156, true);
        }
        if (audioQuestion) {
            audioPair(left, c.audio, "▶  Listen");
            left.addView(text(cafe ? "Match the items and quantities." : "Replay as often as you like.", 15, MUTED));
            left.addView(button("show-transcript", "Need help? Show transcript", () -> {
                speech.stop(); s.help(); progress.save(s); draw("show-transcript");
            }));
            if (s.assisted) { heading(left, c.pt, 19); left.addView(text(c.en, 16, MUTED)); }
            else left.addView(text("Help now; an independent retry later.", 12, MUTED));
        } else left.addView(text(c.kind.equals("dialogue") ? "A real situation. Your reply." : "Read. Think. Choose.", 16, MUTED));
        String prompt = audioQuestion ? (cafe ? c.prompt : c.kind.equals("picture") ? "Which picture matches the word?" : "Listen. What did you hear?") : c.kind.equals("picture") ? "Find: " + c.pt : c.prompt;
        heading(right, prompt, cafe ? 23 : 25);
        right.addView(text(audioQuestion ? (c.kind.equals("picture") ? "Press Listen, then choose a picture." : "Choose what you heard.") : c.grammar() ? c.en
            : c.kind.equals("dialogue") ? "Choose the reply that fits." : c.kind.equals("picture") ? "Choose the matching picture." : "Choose the meaning.", 16, MUTED));
        List<String> choices = s.options();
        for (int i = 0; i < choices.size(); i += 2) {
            LinearLayout r = row();
            for (int j = i; j < Math.min(i + 2, choices.size()); j++) {
                final int option = j; String answer = choices.get(j);
                LinearLayout choice = tile("answer-" + j, answer, "Press OK to " + (cafe ? "serve" : "answer"), PANEL, () -> answer(option));
                choice.setPadding(dp(9), dp(6), dp(9), dp(6));
                if (c.kind.equals("picture")) {
                    String asset = ""; for (StudySession.Card candidate : catalog.games.get("picture")) if (candidate.en.equals(answer)) { asset = candidate.art; break; }
                    picture(choice, asset, 98, true);
                } else if (cafe) choice.addView(art.tray(this, answer), new LinearLayout.LayoutParams(-1, dp(82)));
                else eyebrow(choice, new String[]{"A", "B", "C", "D"}[j]);
                TextView value = text(c.kind.equals("picture") ? new String[]{"A", "B", "C", "D"}[j] : answer, c.kind.equals("picture") ? 20 : 18, INK); value.setTypeface(heavy); value.setGravity(cafe || c.kind.equals("picture") ? Gravity.CENTER : Gravity.START);
                choice.addView(value); choice.setMinimumHeight(dp(cafe ? 121 : 86));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMargins(0, dp(4), dp(8), dp(4)); r.addView(choice, lp);
            }
            right.addView(r);
        }
        split(body, left, right, .31f);
    }
    private void audioPair(LinearLayout parent, String file, String label) {
        LinearLayout sounds = row();
        Button normal = button("listen", label, () -> speech.play(file, false, () -> notice("This recording could not play.")));
        Button slow = button("listen-slow", "▶  Slowly", () -> speech.play(file, true, () -> notice("This recording could not play.")));
        normal.setTextSize(16); slow.setTextSize(16);
        sounds.addView(normal, new LinearLayout.LayoutParams(0, dp(44), 1));
        sounds.addView(slow, new LinearLayout.LayoutParams(0, dp(44), 1)); parent.addView(sounds);
    }
    private void bubble(LinearLayout parent, String label, String pt, String en, int fill) {
        LinearLayout box = column(); box.setPadding(dp(12), dp(6), dp(12), dp(6)); box.setBackground(shape(fill, fill));
        eyebrow(box, label); heading(box, pt, 22); box.addView(text(en, 15, MUTED));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2); lp.setMargins(0, dp(3), 0, dp(5)); parent.addView(box, lp);
    }
    private void conversationStudy() {
        StudySession s = session; StudySession.Card c = s.card();
        LinearLayout scene = column(), exchange = column();
        picture(scene, c.art, 142, false); picture(scene, player() + "-wave", 108, true);
        eyebrow(scene, "YOUR PURPOSE"); scene.addView(text(c.context, 17, INK));
        bubble(exchange, "THE OTHER PERSON", c.prompt, c.heardEn, BLUE);
        if (s.phase == StudySession.Phase.TEACH) {
            bubble(exchange, "YOUR REPLY", c.pt, c.en, MINT);
            exchange.addView(text(c.why, 15, MUTED));
            audioPair(exchange, c.audio, "▶  Hear your reply");
            scene.addView(button("hear-line", "▶  Hear their line", () -> speech.play(c.heardAudio, false, () -> notice("This recording could not play."))));
            exchange.addView(primary("practice", s.teachIndex + 1 < s.firstCount ? "Meet the next reply  →" : "Begin the conversation  →", () -> { speech.stop(); s.practice(); progress.save(s); draw(null); }));
        } else if (s.phase == StudySession.Phase.QUESTION) {
            audioPair(exchange, c.heardAudio, "▶  Hear their line");
            heading(exchange, "What will you say?", 23);
            if (s.assisted) exchange.addView(text("Reply help: " + c.en, 15, GOLD));
            List<String> options = s.options();
            for (int i = 0; i < options.size(); i++) { final int option = i; exchange.addView(button("answer-" + i, options.get(i), () -> answer(option))); }
            scene.addView(button("conversation-help", "Help with my reply", () -> { s.help(); progress.save(s); draw("conversation-help"); }));
            firstAction = exchange.findViewWithTag("answer-0");
        } else {
            eyebrow(scene, s.assisted ? "PRACTISED WITH HELP" : s.wasCorrect() ? "THE CONVERSATION CONTINUES" : "A MODEL EXCHANGE");
            bubble(exchange, s.wasCorrect() ? "YOUR REPLY" : "A SUITABLE REPLY", c.pt, c.en, s.wasCorrect() ? MINT : PEACH);
            bubble(exchange, "WHAT HAPPENS NEXT", c.followup, c.followupEn, BLUE);
            LinearLayout replays = row();
            Button reply = button("listen", "▶  Your reply", () -> listen(c)); reply.setTextSize(15);
            Button next = button("hear-followup", "▶  Next line", () -> speech.play(c.followupAudio, false, () -> notice("This recording could not play."))); next.setTextSize(15);
            replays.addView(reply, new LinearLayout.LayoutParams(0, dp(42), 1)); replays.addView(next, new LinearLayout.LayoutParams(0, dp(42), 1)); exchange.addView(replays);
            scene.addView(text(c.why, 15, MUTED));
            if (!s.wasCorrect() || s.assisted) scene.addView(text("This reply returns once for another try.", 14, GOLD));
            exchange.addView(primary("continue", "Continue the conversation  →", () -> { speech.stop(); s.next(); progress.save(s); draw(null); }));
            firstAction = exchange.findViewWithTag("continue");
        }
        split(body, scene, exchange, .32f);
    }
    private void grammarStudy() {
        StudySession s = session; StudySession.Card c = s.card();
        LinearLayout coach = column(), sentence = column();
        picture(coach, player() + "-think", 164, true);
        heading(coach, "Build a sentence", 22); coach.addView(text("Choose a word to try it in the sentence. Check when you're ready.", 17, MUTED));
        coach.addView(button("sentence-help", "Show the pattern", () -> { s.help(); progress.save(s); draw("sentence-help"); }));
        if (s.assisted) coach.addView(text(c.pt, 19, INK));
        eyebrow(sentence, "YOUR SENTENCE");
        String preview = s.pendingOption < 0 ? c.prompt : c.prompt.replace("___", s.options().get(s.pendingOption));
        TextView built = text(preview, 28, INK); built.setTypeface(heavy); built.setTag("sentence-preview"); sentence.addView(built);
        sentence.addView(text(c.en, 17, MUTED)); space(sentence, 10);
        List<String> options = s.options();
        for (int i = 0; i < options.size(); i += 2) {
            LinearLayout words = row();
            for (int j = i; j < Math.min(i + 2, options.size()); j++) {
                final int option = j; Button word = button("word-" + j, (s.pendingOption == j ? "✓  " : "") + options.get(j), () -> { s.pendingOption = option; progress.save(s); draw("word-" + option); });
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(50), 1); lp.setMargins(0, dp(3), dp(7), dp(3)); words.addView(word, lp);
            }
            sentence.addView(words);
        }
        sentence.addView(primary("check-sentence", "Check my sentence  →", () -> {
            if (s.pendingOption < 0) { notice("Choose a word first. It will appear in your sentence."); return; }
            answer(s.pendingOption);
        }));
        sentence.addView(button("clear-sentence", "Clear my choice", () -> { s.pendingOption = -1; progress.save(s); draw("word-0"); }));
        firstAction = sentence.findViewWithTag("word-0"); split(body, coach, sentence, .32f);
        footer.setText("Arrows  Choose a word     OK  Preview / check     Back  Pause");
    }
    private StudySession.Card cafeWord(int item) {
        for (StudySession.Card c : catalog.cards.values())
            if (c.kind.equals("noun") && c.art.equals(CafeOrder.ART[item])) return c;
        return null;
    }
    private void cafeStudy() {
        StudySession s = session;
        if (s.phase == StudySession.Phase.RESULT) { cafeResults(); return; }
        if (s.phase == StudySession.Phase.TEACH) { cafeWords(); return; }
        String name = player().equals("hadi") ? "Hadi" : "Anna";
        String stage = s.guidedOrder() ? "GUIDED ORDER" : s.index >= s.firstCount ? "ANOTHER TRY" : "LISTEN ON YOUR OWN";
        eyebrow(body, name + (s.players == 2 ? " · PLAYER " + (s.index % 2 + 1) : "") + "  ·  " + stage);
        progressBar(body, s.index, s.deck.size()); space(body, 6);
        footer.setText("Arrows  Move     OK  Add / remove / serve     Back  Pause     ▷Ⅱ  Replay");
        if (s.phase == StudySession.Phase.FEEDBACK) { cafeFeedback(); return; }
        LinearLayout customer = column(), counter = column();
        picture(customer, "cafe", 135, false); space(customer, 6);
        heading(customer, "The customer's order", 18);
        LinearLayout sounds = row();
        sounds.addView(primary("listen", "▶  Listen", () -> listen(s.card())), new LinearLayout.LayoutParams(0, dp(43), 1));
        sounds.addView(button("listen-slow", "Slowly", () -> speech.play(s.card().audio, true, () -> notice("This recording could not play."))), new LinearLayout.LayoutParams(0, dp(43), 1));
        customer.addView(sounds); space(customer, 7);
        if (s.guidedOrder() || s.assisted) {
            LinearLayout hint = column(); hint.setPadding(dp(10), dp(8), dp(10), dp(8)); hint.setBackground(shape(BLUE, BLUE));
            eyebrow(hint, s.guidedOrder() ? "LET'S DO ONE TOGETHER" : "TRANSCRIPT HELP");
            heading(hint, s.card().pt, 18); hint.addView(text(s.card().answer, 15, MUTED));
            hint.addView(text(s.guidedOrder() ? "Add one coffee. Then press Serve." : "Keep building your tray. Try this order again later without help.", 14, INK));
            customer.addView(hint);
        } else {
            customer.addView(text("Listen for the food and how many. Replay as often as you like.", 15, MUTED));
            customer.addView(button("cafe-hint", "Show the words", () -> {
                s.assisted = true; progress.save(s); draw("cafe-hint");
            }));
            customer.addView(text("With help now. On your own on the retry.", 12, MUTED));
        }
        heading(counter, "Build the customer's tray", 24);
        counter.addView(text("Choose + to add one. Choose − to remove one.", 15, MUTED));
        counter.addView(art.tray(this, s.tray.label()), new LinearLayout.LayoutParams(-1, dp(66)));
        TextView contents = text(s.tray.total() == 0 ? "Your tray is empty. Add the items you hear." : "Your tray: " + s.tray.label(), 14, MUTED);
        contents.setTag("tray-contents"); counter.addView(contents);
        int[] items = {0, 1, 2, 5};
        for (int row = 0; row < 2; row++) {
            LinearLayout shelf = row();
            for (int col = 0; col < 2; col++) {
                final int item = items[row * 2 + col];
                LinearLayout card = column(); card.setPadding(dp(8), dp(4), dp(8), dp(4)); card.setBackground(shape(PANEL, PANEL));
                LinearLayout label = row(); label.setGravity(Gravity.CENTER_VERTICAL);
                label.addView(art.character(this, CafeOrder.ART[item]), new LinearLayout.LayoutParams(dp(47), dp(45)));
                LinearLayout copy = column(); copy.setPadding(dp(7), 0, 0, 0);
                heading(copy, CafeOrder.PT[item], 18); copy.addView(text(CafeOrder.EN[item] + " · on tray: " + s.tray.quantity(item), 13, MUTED));
                label.addView(copy, new LinearLayout.LayoutParams(0, -2, 1)); card.addView(label);
                LinearLayout controls = row();
                Button minus = button("tray-minus-" + item, "−  Remove", () -> changeTray(item, -1));
                Button plus = button("tray-plus-" + item, "+  Add", () -> changeTray(item, 1));
                for (Button control : new Button[]{minus, plus}) {
                    control.setTextSize(15); control.setMinHeight(dp(34)); control.setMinimumHeight(dp(34));
                    control.setPadding(dp(8), dp(3), dp(8), dp(3));
                }
                minus.setContentDescription("Remove one " + CafeOrder.EN[item]);
                plus.setContentDescription("Add one " + CafeOrder.EN[item]);
                LinearLayout.LayoutParams a = new LinearLayout.LayoutParams(0, dp(35), 1); a.setMargins(0, 0, dp(5), 0);
                controls.addView(minus, a); controls.addView(plus, new LinearLayout.LayoutParams(0, dp(35), 1)); card.addView(controls);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(95), 1); lp.setMargins(0, dp(3), dp(7), dp(3)); shelf.addView(card, lp);
                if (item == 0) firstAction = plus;
            }
            counter.addView(shelf);
        }
        LinearLayout actions = row();
        actions.addView(primary("serve", "Serve this order  →", this::serveTray), new LinearLayout.LayoutParams(0, dp(45), 2));
        Button clear = button("clear-tray", "Clear tray", () -> { s.tray.clear(); progress.save(s); draw("clear-tray"); });
        actions.addView(clear, new LinearLayout.LayoutParams(0, dp(45), 1)); counter.addView(actions);
        split(body, customer, counter, .31f);
    }
    private void cafeWords() {
        LinearLayout scene = column(), introduction = column(); picture(scene, "cafe", 125, false);
        eyebrow(introduction, "AT THE CAFÉ · MEET THE WORDS"); heading(introduction, "Four words. Your first order.", 28);
        introduction.addView(text("Choose a picture to hear its Portuguese name.\nSay the article and word together.", 16, MUTED));
        introduction.addView(text("Queria …, por favor.  =  I'd like …, please.", 17, INK));
        split(body, scene, introduction, .30f); space(body, 7);
        LinearLayout words = row();
        for (int item : new int[]{0, 1, 2, 5}) {
            StudySession.Card c = cafeWord(item);
            LinearLayout word = tile("cafe-word-" + item, CafeOrder.PT[item], "Listen to " + CafeOrder.EN[item], PANEL, () -> { if (c != null) listen(c); });
            word.setPadding(dp(12), dp(6), dp(12), dp(6));
            picture(word, CafeOrder.ART[item], 54, true);
            heading(word, CafeOrder.PT[item], 20);
            TextView meaning = text(CafeOrder.EN[item], 14, MUTED); meaning.setTag("cafe-meaning-" + item); word.addView(meaning);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(125), 1); lp.setMargins(0, 0, dp(8), 0); words.addView(word, lp);
        }
        body.addView(words); space(body, 7);
        body.addView(text("HOW MANY?    um café = 1 coffee       dois pães = 2 bread rolls", 16, INK));
        body.addView(button("cafe-quantity-example", "▶  Hear a two-item order", () -> listen(session.deck.get(1))));
        body.addView(text("One order together, then three on your own. No timer.", 15, MUTED));
        body.addView(primary("practice", "Build my first order  →", () -> { speech.stop(); session.practice(); progress.save(session); draw(null); }));
        footer.setText("Arrows  Choose a word     OK  Listen / start     Back  Pause");
    }
    private void changeTray(int item, int delta) {
        if (session == null || session.phase != StudySession.Phase.QUESTION) return;
        if (!session.tray.change(item, delta)) {
            if (delta > 0) notice("Up to three of each item and five items on a tray. Remove an item to change your order.");
            return;
        }
        progress.save(session); draw("tray-" + (delta > 0 ? "plus-" : "minus-") + item);
    }
    private void serveTray() {
        if (session == null || session.phase != StudySession.Phase.QUESTION) return;
        if (session.tray.total() == 0) { notice("Add something to your tray before you serve it."); return; }
        speech.stop(); if (!session.submitTray()) return;
        // Teaching and transcript help are practice, not evidence of independent listening.
        if (!session.guidedOrder() && (!session.assisted || !session.wasCorrect()))
            progress.record(session.card().id, session.wasCorrect());
        progress.save(session); draw(null);
    }
    private void cafeFeedback() {
        StudySession s = session; boolean right = s.wasCorrect();
        LinearLayout tray = column(), copy = column();
        tray.setPadding(dp(12), dp(10), dp(12), dp(10)); tray.setBackground(shape(right ? MINT : PEACH, right ? MINT : PEACH));
        eyebrow(tray, "THE CUSTOMER'S ORDER");
        tray.addView(art.tray(this, s.card().answer), new LinearLayout.LayoutParams(-1, dp(115)));
        heading(tray, s.card().answer, 19); picture(tray, player() + (right ? "-cheer" : "-think"), 118, true);
        eyebrow(copy, s.guidedOrder() ? "GUIDED PRACTICE" : s.assisted ? "PRACTISED WITH HELP" : "LISTENING PRACTICE");
        heading(copy, right ? "Order served!" : "Let's check the order.", 29);
        heading(copy, s.card().pt, 24);
        copy.addView(text("Queria = I'd like. Por favor = please.\nUm / uma = one. Dois / duas = two.", 17, MUTED));
        if (!right) copy.addView(text("Your tray: " + s.tray.label() + "\nThe correct tray is shown on the left. You'll try this order again.", 16, INK));
        else copy.addView(text(s.guidedOrder() ? "You built your first order. Now listen without the words." : s.assisted ? "You used the words to help. This order will return for an independent try." : "You matched the food and quantities by listening.", 17, INK));
        copy.addView(button("listen", "▶  Hear the order", () -> listen(s.card())));
        copy.addView(primary("continue", "Continue  →", () -> { speech.stop(); s.next(); progress.save(s); draw(null); }));
        firstAction = copy.findViewWithTag("continue");
        split(body, tray, copy, .37f);
        footer.setText("Arrows  Move     OK  Continue / replay     Back  Pause");
    }
    private void cafeResults() {
        StudySession s = session; LinearLayout scene = column(), copy = column(); picture(scene, "cafe", 145, false);
        picture(scene, learner() + "-cheer", 145, true);
        eyebrow(copy, "YOUR CAFÉ RECAP"); heading(copy, "A café order, in Portuguese.", 26);
        heading(copy, s.correct + " / " + s.independentCount(), 35);
        copy.addView(text("Matched independently on your first try.", 16, MUTED));
        copy.addView(text("1 guided" + (s.assistedCorrect > 0 ? " · " + s.assistedCorrect + " with transcript help" : "") + " · retries separate", 14, MUTED));
        int pending = 0; for (StudySession.Card c : s.deck.subList(1, s.firstCount)) if (progress.missed(c.id)) pending++;
        final int pendingCount = pending;
        copy.addView(text(pending > 0 ? pending + " orders need more practice. Replay them below." : "Replay an order, then say it aloud.", 16, INK));
        for (int i = 1; i < s.firstCount; i++) {
            StudySession.Card c = s.deck.get(i);
            Button replay = button("recap-" + c.id, "▶  " + c.pt, () -> listen(c)); replay.setTextSize(15);
            replay.setMinHeight(dp(36)); replay.setMinimumHeight(dp(36)); replay.setPadding(dp(10), dp(3), dp(10), dp(3));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dp(36)); lp.setMargins(0, dp(3), 0, dp(3)); copy.addView(replay, lp);
        }
        LinearLayout actions = row();
        Button again = primary("again", pending > 0 || s.correct < s.independentCount() ? "Try these orders again  →" : "More café phrases  →", () -> {
            if (pendingCount > 0 || s.correct < s.independentCount()) {
                session = s.restart(); progress.save(session); draw(null);
            } else { session = null; progress.save(null); topicId = "cafe"; phraseIndex = 0; navigate("phrase"); }
        });
        again.setTextSize(16); actions.addView(again, new LinearLayout.LayoutParams(0, dp(48), 2));
        Button finish = button("finish", "Home", () -> { session = null; progress.save(null); navigate("home"); });
        finish.setTextSize(16); actions.addView(finish, new LinearLayout.LayoutParams(0, dp(48), 1)); copy.addView(actions);
        firstAction = copy.findViewWithTag("again");
        split(body, scene, copy, .32f); footer.setText("Arrows  Move     OK  Replay / choose     Back  Home");
    }
    private void listen(StudySession.Card c) {
        speech.play(c.audio, progress.prefs.getBoolean("slow", false), () ->
            notice("This recording could not play. You can use Show transcript, or choose another activity."));
    }
    private void answer(int option) {
        speech.stop();
        if (!session.answer(option)) return;
        if (!session.assisted || !session.wasCorrect()) progress.record(session.card().id, session.wasCorrect());
        progress.save(session); draw(null);
    }
    private void results() {
        StudySession s = session; LinearLayout left = column(), right = column();
        boolean pictures = s.card().kind.equals("picture");
        if (pictures) {
            picture(left, s.card().art, 115, true); LinearLayout collection = row();
            for (StudySession.Card c : s.deck.subList(0, s.firstCount)) collection.addView(art.character(this, c.art), new LinearLayout.LayoutParams(0, dp(68), 1));
            left.addView(collection);
        } else picture(left, s.card().art.isEmpty() ? "conversation" : s.card().art, 130, false);
        picture(left, learner() + "-cheer", 155, true);
        eyebrow(right, "YOUR LEARNING RECAP"); heading(right, s.correct + " / " + s.firstCount + " on your own", 28);
        right.addView(text("First tries" + (s.assistedCorrect > 0 ? " · " + s.assistedCorrect + " practised with help" : "") + " · retries separate", 14, MUTED));
        int pending = 0; for (StudySession.Card c : s.deck.subList(0, s.firstCount)) if (!progress.known(c.id)) pending++;
        right.addView(text(pending == 0 ? "You recalled every item. Replay one and say it aloud." : pending + " items need more practice. Replay them below.", 15, INK));
        for (StudySession.Card c : s.deck.subList(0, Math.min(3, s.firstCount))) {
            Button recap = button("recap-" + c.id, "▶  " + c.pt + "  ·  " + c.en, () -> listen(c));
            recap.setTextSize(15); recap.setMinHeight(dp(36)); recap.setMinimumHeight(dp(36)); recap.setPadding(dp(9), dp(3), dp(9), dp(3));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2); lp.setMargins(0, dp(2), 0, dp(2)); right.addView(recap, lp);
        }
        if (!s.lessonId.isEmpty()) {
            Catalog.Lesson l = catalog.lesson(s.lessonId);
            if (l != null) {
                int learned = progress.learned(l); right.addView(text(learned + " / " + l.cards.size() + " items in this lesson", 14, MUTED));
                Catalog.Lesson next = null; int position = catalog.lessons.indexOf(l);
                if (position + 1 < catalog.lessons.size()) next = catalog.lessons.get(position + 1);
                final Catalog.Lesson nextLesson = next;
                right.addView(primary("next-batch", learned < l.cards.size() ? "Continue this lesson  →" : next == null ? "Explore the course  →" : "Next learning goal  →", () -> {
                    if (learned < l.cards.size()) startLesson(l);
                    else { session = null; progress.save(null); if (nextLesson == null) navigate("units"); else { lessonId = nextLesson.id; unitId = nextLesson.unit; navigate("lesson"); } }
                }));
            }
        } else {
            String action = pictures && s.mode.equals("learn") ? "Listen & match these pictures  →" : "Try this set again  →";
            right.addView(primary("again", action, () -> {
                if (pictures && s.mode.equals("learn")) start("picture", "", s.deck.subList(0, s.firstCount), s.players);
                else { session = s.restart(); progress.save(session); draw(null); }
            }));
            if (pictures || s.mode.equals("conversation") || s.mode.equals("listen")) right.addView(button("more-worlds", "Choose another " + (pictures ? "world" : s.mode.equals("conversation") ? "conversation" : "listening topic"), () -> {
                session = null; progress.save(null); navigate(pictures ? "worlds" : s.mode.equals("conversation") ? "conversations" : "listening");
            }));
        }
        right.addView(button("finish", "Home", () -> { session = null; progress.save(null); navigate("home"); }));
        firstAction = right.findViewWithTag(s.lessonId.isEmpty() ? "again" : "next-batch");
        split(body, left, right, .30f); footer.setText("Arrows  Move     OK  Replay / choose     Back  Home");
    }
    private void stats() {
        int complete = 0, known = 0, missed = 0, due = 0;
        for (Catalog.Lesson l : catalog.lessons) if (progress.learned(l) == l.cards.size()) complete++;
        for (String id : catalog.cards.keySet()) { if (progress.known(id)) known++; if (progress.missed(id)) missed++; if (progress.due(id)) due++; }
        title("Small steps. Real progress.", "Every word you practise is a little more confidence.");
        LinearLayout words = column(), chapters = column(), review = column();
        int[] fills = {BLUE, MINT, PEACH}; LinearLayout[] cards = {words, chapters, review};
        String[] values = {String.valueOf(known), String.valueOf(complete), String.valueOf(missed)};
        String[] names = {"items practised correctly", "lessons completed", "items to revisit"};
        for (int i = 0; i < cards.length; i++) { cards[i].setPadding(dp(16), dp(8), dp(16), dp(12)); cards[i].setBackground(shape(fills[i], fills[i])); heading(cards[i], values[i], 40); cards[i].addView(text(names[i], 16, INK)); }
        threeCards(body, cards); space(body, 14);
        LinearLayout left = column(), right = column(); picture(left, "conversation", 180, false);
        heading(right, "Keep the conversation going", 24);
        right.addView(text("Revisit the tricky bits, or discover something new.", 17, MUTED));
        if (missed > 0) right.addView(primary("review", "Review your mistakes  →", () -> intro("review")));
        right.addView(button("browse", "Explore the course", () -> navigate("units")));
        if (due > 0) right.addView(button("daily-revision", "Scheduled revision  ·  " + due + " ready", () -> startRevision()));
        right.addView(text("Revision intervals: 1, 3, 7, 14 and 30 days. Same-day repeats do not increase the interval.", 13, MUTED));
        right.addView(text("Together sessions share this TV's learning progress.", 13, MUTED)); split(body, left, right, .35f);
    }
    private void settings() {
        title("Make it yours", "Choose your companion and get comfortable.");
        LinearLayout hadi = tile("learner-hadi", "Hadi", "Solo companion", BLUE,
            () -> { progress.prefs.edit().putBoolean("anna", false).apply(); draw("learner-hadi"); });
        LinearLayout anna = tile("learner-anna", "Anna", "Solo companion", PEACH,
            () -> { progress.prefs.edit().putBoolean("anna", true).apply(); draw("learner-anna"); });
        picture(hadi, "hadi-wave", 124, true); cardText(hadi, "Hadi", learner().equals("hadi") ? "Your solo companion ✓" : "Choose for solo sessions");
        picture(anna, "ana-wave", 124, true); cardText(anna, "Anna", learner().equals("ana") ? "Your solo companion ✓" : "Choose for solo sessions");
        threeCards(body, hadi, anna);
        boolean slow = progress.prefs.getBoolean("slow", false), safe = progress.prefs.getBoolean("safeArea", true);
        pair("slow", "Speech  ·  " + (slow ? "Slower" : "Normal"), () -> { progress.prefs.edit().putBoolean("slow", !slow).apply(); draw("slow"); },
            "safe", "Margins  ·  " + (safe ? "Comfortable" : "Compact"), () -> { progress.prefs.edit().putBoolean("safeArea", !safe).apply(); draw("safe"); });
        body.addView(text("European Portuguese · All lessons and recordings work offline.\nUse your remote's volume buttons to adjust the speech.", 15, MUTED));
        add("reset", "Reset learning progress…", () -> {
            modal = new AlertDialog.Builder(this).setTitle("Reset this TV's learning progress?")
                .setMessage("This removes your saved session and answers. It cannot be undone.")
                .setNegativeButton("Keep progress", null).setPositiveButton("Reset progress", (d, w) -> {
                    progress.prefs.edit().remove("evidence").remove("session").remove("schedule").apply(); progress = new ProgressStore(this); session = null; draw("reset");
                }).create(); modal.show(); modal.getButton(AlertDialog.BUTTON_NEGATIVE).requestFocus();
        });
    }
    private void notice(String message) {
        if (isFinishing() || isDestroyed()) return;
        if (modal != null && modal.isShowing()) return;
        modal = new AlertDialog.Builder(this).setMessage(message).setPositiveButton("OK", null).create(); modal.show();
    }
    private void pause() {
        if (session == null || (modal != null && modal.isShowing())) return;
        speech.stop(); progress.save(session);
        modal = new AlertDialog.Builder(this).setTitle("Take your time.").setItems(new String[]{"Resume", "Restart this session", "Save & return Home"}, (d, which) -> {
            if (which == 1) { session = session.restart(); progress.save(session); draw(null); }
            else if (which == 2) navigate("home");
        }).create(); modal.show();
    }
    @Override public void onBackPressed() {
        if (catalog == null) return;
        if (screen.equals("session")) { if (session.phase == StudySession.Phase.RESULT) navigate("home"); else pause(); return; }
        switch (screen) {
            case "world": navigate("worlds"); break;
            case "worlds": case "conversations": case "listening": navigate("games"); break;
            case "phrase": navigate("phrasebook"); break;
            case "lesson": navigate("lessons"); break;
            case "lessons": navigate("units"); break;
            case "intro": navigate(gameId.equals("conversation") ? "conversations" : gameId.equals("listen") ? "listening" : gameId.equals("review") ? "progress" : "games"); break;
            case "home":
                modal = new AlertDialog.Builder(this).setTitle("Leave Party Português?")
                    .setMessage("Your progress and unfinished session are saved.")
                    .setNegativeButton("Keep learning", null).setPositiveButton("Exit", (d, w) -> finish()).create();
                modal.show(); modal.getButton(AlertDialog.BUTTON_NEGATIVE).requestFocus(); break;
            default: navigate("home");
        }
    }
    @Override public boolean dispatchKeyEvent(KeyEvent event) {
        int code = event.getKeyCode();
        if (code == KeyEvent.KEYCODE_BACK || code == KeyEvent.KEYCODE_BUTTON_B) {
            if (event.getAction() == KeyEvent.ACTION_UP && !event.isCanceled()) onBackPressed(); return true;
        }
        if ((code == KeyEvent.KEYCODE_DPAD_CENTER || code == KeyEvent.KEYCODE_ENTER || code == KeyEvent.KEYCODE_NUMPAD_ENTER)
                && event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() > 0) return true;
        if (code >= KeyEvent.KEYCODE_DPAD_UP && code <= KeyEvent.KEYCODE_DPAD_RIGHT && event.getAction() == KeyEvent.ACTION_DOWN) {
            long now = SystemClock.uptimeMillis();
            if (event.getRepeatCount() > 0 && now - lastArrow < 100) return true; lastArrow = now;
        }
        if (code == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE && screen.equals("phrase")) {
            List<StudySession.Card> cards = phraseCards();
            if (event.getAction() == KeyEvent.ACTION_UP && !cards.isEmpty()) listen(cards.get(Math.min(phraseIndex, cards.size() - 1)));
            return true;
        }
        if (code == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE && session != null && screen.equals("session")) {
            if (event.getAction() == KeyEvent.ACTION_UP) listen(session.card()); return true;
        }
        return super.dispatchKeyEvent(event);
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        state.putString("screen", screen); state.putString("unit", unitId); state.putString("lesson", lessonId); state.putString("game", gameId);
        state.putString("conversation", conversationId); state.putString("world", worldId); state.putString("topic", topicId); state.putInt("phrase", phraseIndex);
        if (progress != null) progress.save(session); super.onSaveInstanceState(state);
    }
    @Override protected void onPause() {
        super.onPause(); if (speech != null) speech.stop();
        if (progress != null) progress.save(session);
        backgrounded = true; getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
    @Override protected void onResume() {
        super.onResume();
        if (backgrounded && screen.equals("session") && session != null && session.phase != StudySession.Phase.RESULT) pause();
        if (screen.equals("session") || screen.equals("phrase")) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        backgrounded = false;
    }
    @Override protected void onDestroy() { if (speech != null) speech.stop(); if (modal != null) modal.dismiss(); super.onDestroy(); }
}
