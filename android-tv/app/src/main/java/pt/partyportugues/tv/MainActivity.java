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
    private String topicId = "greetings";
    private int phraseIndex;
    private LinearLayout root, body;
    private TextView footer;
    private Button audioControl;
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
            if (audioControl != null) audioControl.setText(speech.isPlaying() ? "♪  Playing…" : "▶  Listen again");
        });
        heavy = Typeface.create(regular, Typeface.BOLD);
        try {
            regular = Typeface.createFromAsset(getAssets(), "art/fonts/nunito.ttf");
            heavy = Typeface.createFromAsset(getAssets(), "art/fonts/nunito-bold.ttf");
        } catch (Exception ignored) { }
        if (state != null) {
            screen = state.getString("screen", "home"); unitId = state.getString("unit", "");
            lessonId = state.getString("lesson", ""); gameId = state.getString("game", "dialogue");
            topicId = state.getString("topic", "greetings"); phraseIndex = state.getInt("phrase", 0);
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
        if (key.equals("listen")) audioControl = b;
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
        if (screen.equals("games") || screen.equals("intro")) return "games";
        return screen;
    }
    private void draw(String focusKey) {
        if (catalog == null || art == null) return;
        firstAction = null; audioControl = null; boolean inSession = screen.equals("session") && session != null;
        getWindow().setFlags(inSession ? WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON : 0, WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        root = column(); root.setBackgroundColor(BG);
        densityPadding = progress.prefs.getBoolean("safeArea", true) ? 26 : 16;
        root.setPadding(dp(densityPadding), dp(12), dp(densityPadding), dp(10));
        LinearLayout header = row(); header.setGravity(Gravity.CENTER_VERTICAL);
        TextView brand = text("❖  Português", 23, INK); brand.setTypeface(heavy);
        header.addView(brand, new LinearLayout.LayoutParams(0, dp(46), 1.45f));
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
        root.addView(header); space(root, 9); firstAction = null;
        ScrollView scroll = new ScrollView(this); scroll.setFillViewport(true); scroll.setClipToPadding(false);
        scroll.setVerticalScrollBarEnabled(false); scroll.setFocusable(false); scroll.setDescendantFocusability(ViewGroup.FOCUS_AFTER_DESCENDANTS);
        root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
        body = column(); body.setPadding(dp(3), 0, dp(3), dp(6)); scroll.addView(body);
        footer = text("↔  Arrows  Move       OK  Choose       ↶  Back  Return", 12, MUTED); root.addView(footer);
        switch (screen) {
            case "units": units(); break;
            case "lessons": lessons(); break;
            case "lesson": lesson(); break;
            case "games": games(); break;
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
    private void navigate(String destination) { speech.stop(); screen = destination; draw(null); }
    private void home() {
        Catalog.Lesson next = catalog.lessons.get(0);
        for (Catalog.Lesson l : catalog.lessons) if (progress.learned(l) < l.cards.size()) { next = l; break; }
        final Catalog.Lesson chosen = next;
        LinearLayout copy = column(), scene = column();
        eyebrow(copy, "A LITTLE, EVERY DAY"); heading(copy, "Your next stop:\nPortuguese.", 44);
        copy.addView(text("Real conversations. Your pace.", 17, MUTED)); space(copy, 6);
        if (session != null && session.phase != StudySession.Phase.RESULT) {
            copy.addView(primary("resume", "Resume your adventure  →", () -> { screen = "session"; draw(null); }));
            copy.addView(button("next-lesson", "Explore this lesson", () -> { lessonId = chosen.id; unitId = chosen.unit; navigate("lesson"); }));
        } else copy.addView(primary("next-lesson", "Continue learning  →", () -> { lessonId = chosen.id; unitId = chosen.unit; navigate("lesson"); }));
        copy.addView(text(chosen.title, 13, MUTED));
        copy.addView(text(progress.learned(chosen) + " / " + chosen.cards.size() + " items practised correctly", 12, MUTED));
        progressBar(copy, progress.learned(chosen), chosen.cards.size());
        picture(scene, "home", 254, false); split(body, copy, scene, .43f);
        space(body, 8); heading(body, "Make yourself at home", 22);
        LinearLayout learn = tile("browse", "Everyday Portuguese", "Explore the course", BLUE, () -> navigate("units"));
        miniCard(learn, "book", "Everyday Portuguese", "Explore the course");
        LinearLayout play = tile("play", "Real-life phrases", "Six illustrated adventures", PEACH, () -> navigate("phrasebook"));
        miniCard(play, "together", "Real-life phrases", "Listen. Save. Try it.");
        int misses = 0; for (String id : catalog.cards.keySet()) if (progress.due(id)) misses++;
        final boolean ready = misses > 0;
        LinearLayout review = tile("home-review", "Keep it going", ready ? misses + " items to revisit" : "Your learning journey", MINT,
            () -> { if (ready) startRevision(); else navigate("progress"); });
        miniCard(review, "review", "Keep it going", ready ? misses + " items ready for revision" : "Your learning journey");
        threeCards(body, learn, play, review);
    }
    private void miniCard(LinearLayout card, String kind, String name, String subtitle) {
        LinearLayout copy = column(), image = column(); cardText(copy, name, subtitle);
        if (kind.equals("together")) picture(image, "ana-wave", 83, true);
        else image.addView(art.symbol(this, kind), new LinearLayout.LayoutParams(-1, dp(83)));
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
        title("Portuguese for real life", "Six little adventures. Useful words you can take with you.");
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
                picture(card, t.art, 76, false); heading(card, t.title, 18);
                card.addView(text(t.goal, 12, MUTED));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(151), 1); lp.setMargins(0, dp(5), dp(9), dp(5)); r.addView(card, lp);
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
            case "u04": case "u08": return "station";
            case "u02": case "u05": return "home-life";
            case "u06": return "pharmacy";
            case "a1": return "market";
            default: return "conversation";
        }
    }
    private void units() {
        title("Everyday Portuguese", "A small adventure, one chapter at a time.");
        List<Catalog.Unit> us = catalog.units;
        for (int i = 0; i < us.size(); i += 3) {
            LinearLayout r = row();
            for (int j = i; j < Math.min(i + 3, us.size()); j++) {
                Catalog.Unit u = us.get(j); int fill = new int[]{BLUE, PEACH, MINT, LILAC}[j % 4];
                LinearLayout card = tile("unit-" + u.id, u.title, u.subtitle, fill, () -> { unitId = u.id; navigate("lessons"); });
                picture(card, sceneForUnit(u.id), 58, false);
                eyebrow(card, u.label); heading(card, u.title, 19); card.addView(text(u.subtitle, 14, MUTED));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMargins(0, dp(5), dp(10), dp(5)); r.addView(card, lp);
            }
            body.addView(r);
        }
    }
    private void lessons() {
        Catalog.Unit u = null; for (Catalog.Unit item : catalog.units) if (item.id.equals(unitId)) u = item;
        title(u == null ? "Lessons" : u.title, u == null ? "" : u.subtitle);
        int number = 0;
        for (Catalog.Lesson l : catalog.lessons) if (l.unit.equals(unitId)) {
            int n = progress.learned(l); number++;
            LinearLayout card = tile("lesson-" + l.id, l.title, n + " / " + l.cards.size() + " practised", PANEL,
                () -> { lessonId = l.id; navigate("lesson"); });
            eyebrow(card, "LESSON " + number + (n == l.cards.size() ? "  ·  COMPLETED" : ""));
            cardText(card, l.title, n + " / " + l.cards.size() + " items practised correctly"); progressBar(card, n, l.cards.size());
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2); lp.setMargins(0, dp(4), 0, dp(8)); body.addView(card, lp);
        }
    }
    private void lesson() {
        Catalog.Lesson l = catalog.lesson(lessonId); if (l == null) { screen = "units"; units(); return; }
        LinearLayout left = column(), right = column();
        picture(left, learner() + "-wave", 255, true); left.setBackground(shape(BLUE, BLUE));
        eyebrow(right, "YOUR NEXT LITTLE ADVENTURE"); heading(right, l.title, 29);
        right.addView(text("Learn up to 8 items. Take your time.", 17, MUTED));
        space(right, 10); step(right, 1, "Meet the words", "Read, listen, and say them out loud.");
        step(right, 2, "Give it a try", "Arrows to choose. OK to answer.");
        step(right, 3, "Keep what you learn", "Mistakes return once. Progress is saved.");
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
        title("A little play. A lot to say.", "Choose your adventure. Play solo or take turns with Hadi & Anna.");
        String[] ids = {"dialogue", "cafe", "listen", "grammar"};
        String[] names = {"Choose the reply", "At the café", "Listen & find", "Complete the sentence"};
        String[] descriptions = {"A conversation that clicks", "Hear it. Match it. Serve it.", "Tune into Portuguese", "Find the missing piece"};
        int[] fills = {BLUE, PEACH, LILAC, MINT};
        LinearLayout cards = row();
        for (int i = 0; i < ids.length; i++) {
            final String id = ids[i];
            LinearLayout card = tile("game-" + id, names[i], descriptions[i], fills[i], () -> intro(id));
            if (id.equals("dialogue")) picture(card, "conversation", 124, false);
            else if (id.equals("cafe")) picture(card, "cafe", 124, false);
            else card.addView(art.symbol(this, id), new LinearLayout.LayoutParams(-1, dp(124)));
            space(card, 5); eyebrow(card, "UP TO 8 · YOUR PACE"); cardText(card, names[i], descriptions[i]);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(258), 1); lp.setMargins(0, dp(7), dp(10), dp(7)); cards.addView(card, lp);
        }
        body.addView(cards); space(body, 6);
        int misses = 0; for (String id : catalog.cards.keySet()) if (progress.missed(id)) misses++;
        if (misses > 0) add("review", "A second chance  ·  Review " + misses + " tricky items  →", () -> intro("review"));
        else body.addView(text("No timer. No rush. Listen again whenever you like.", 16, MUTED));
    }
    private void intro(String id) { gameId = id; navigate("intro"); }
    private String gameTitle(String id) {
        switch (id) { case "cafe": return "At the café"; case "listen": return "Listen & find";
            case "grammar": return "Complete the sentence"; case "review": return "Review your mistakes";
            default: return "Choose the reply"; }
    }
    private String rules(String id) {
        switch (id) {
            case "cafe": return "You are serving a customer.\nPress Listen to hear the order. Choose the matching tray.\nPay attention to both the food and the quantities.";
            case "listen": return "Press Listen to hear a Portuguese word or phrase.\nChoose its English meaning. You can listen as often as you like.\nFor similar-sounding words, choose the Portuguese word you heard.";
            case "grammar": return "Read the sentence and the hint.\nChoose the word or phrase that fills the gap.\nAfter each answer, see the complete sentence and an explanation.";
            case "review": return "Try the items you missed previously.\nChoose an answer, then read the correction.\nA correct answer removes the item from your review list.";
            default: return "Read the situation and the message you want to say.\nChoose the Portuguese reply that fits that specific situation.\nAfter each answer, see why the reply works.";
        }
    }
    private void introduction() {
        LinearLayout left = column(), right = column();
        String scene = gameId.equals("cafe") ? "cafe" : "conversation";
        if (gameId.equals("dialogue") || gameId.equals("cafe")) picture(left, scene, 264, false);
        else { left.setBackground(shape(gameId.equals("listen") ? LILAC : MINT, PANEL));
            left.addView(art.symbol(this, gameId), new LinearLayout.LayoutParams(-1, dp(96))); picture(left, learner() + "-think", 172, true); }
        left.addView(text("Hadi & Anna · Your Portuguese companions", 13, MUTED));
        eyebrow(right, "THE GOAL"); heading(right, gameTitle(gameId), 29);
        String[] lines = rules(gameId).split("\n");
        step(right, 1, gameId.equals("cafe") || gameId.equals("listen") ? "Listen" : "Look", lines[0]);
        step(right, 2, "Choose", lines[1]); step(right, 3, "Learn", lines[2]);
        String example;
        switch (gameId) {
            case "cafe": example = "Queria dois cafés, por favor. → 2 coffees"; break;
            case "listen": example = "Hear Olá! → Choose Hi!"; break;
            case "grammar": example = "Nós ___ portugueses. → somos"; break;
            case "review": example = "A correct answer clears an item from review."; break;
            default: example = "Como te chamas? → Chamo-me Ana.";
        }
        LinearLayout hint = column(); hint.setPadding(dp(12), dp(5), dp(12), dp(5)); hint.setBackground(shape(BLUE, BLUE));
        eyebrow(hint, "FOR EXAMPLE"); hint.addView(text(example, 16, INK)); right.addView(hint);
        eyebrow(right, "CONTROLS · ARROWS + OK · BACK PAUSES");
        right.addView(text("Together: pass the remote after each turn.\nMistakes return once. Progress is shared.", 14, MUTED));
        LinearLayout buttons = row();
        Button solo = primary("solo", "Play solo  →", () -> startGame(1)), together = button("together", "Play together", () -> startGame(2));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMargins(0, dp(4), dp(8), 0);
        buttons.addView(solo, lp); buttons.addView(together, new LinearLayout.LayoutParams(0, -2, 1)); right.addView(buttons);
        split(body, left, right, .34f);
    }
    private List<StudySession.Card> practiceDeck(String mode) {
        if (catalog.games.containsKey(mode)) return new ArrayList<>(catalog.games.get(mode));
        List<StudySession.Card> deck = new ArrayList<>(), backup = new ArrayList<>();
        for (StudySession.Card c : catalog.cards.values()) {
            if (!mode.equals("review") && (c.kind.equals("cafe") || c.kind.equals("dialogue"))) continue;
            boolean eligible = mode.equals("review") ? progress.missed(c.id)
                : mode.equals("grammar") ? c.grammar() : !c.audio.isEmpty() && !c.grammar();
            if (!eligible) continue;
            backup.add(c); if (progress.known(c.id) || progress.missed(c.id)) deck.add(c);
        }
        if (deck.isEmpty()) deck = backup.subList(0, Math.min(24, backup.size()));
        return new ArrayList<>(deck);
    }
    private void startGame(int players) {
        List<StudySession.Card> deck = practiceDeck(gameId);
        if (!gameId.equals("review")) Collections.shuffle(deck);
        start(gameId, "", deck, players);
    }
    private void start(String mode, String lesson, List<StudySession.Card> deck, int players) {
        if (deck.isEmpty()) { notice("No items are ready for this activity yet. Try a lesson first."); return; }
        Runnable go = () -> {
            speech.stop(); session = new StudySession(mode, lesson, deck.subList(0, Math.min(8, deck.size())), System.nanoTime());
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
        boolean audioQuestion = s.mode.equals("listen") || c.kind.equals("cafe") || c.kind.equals("minimalPair");
        if (s.phase == StudySession.Phase.RESULT) { results(); return; }
        String who = player(), name = who.equals("hadi") ? "Hadi" : "Anna";
        String turn = s.players == 2 ? "PLAYER " + (s.index % 2 + 1) + " · " + name + "   ·   " : name + "   ·   ";
        String step = s.index >= s.firstCount ? "RETRY " + (s.index - s.firstCount + 1) + " / " + s.missed.size()
            : "QUESTION " + (s.index + 1) + " / " + s.firstCount;
        LinearLayout meta = row(); meta.setGravity(Gravity.CENTER_VERTICAL);
        meta.addView(art.character(this, who), new LinearLayout.LayoutParams(dp(32), dp(32)));
        TextView label = text("  " + turn + step + "   ·   " + (s.mode.equals("learn") ? "LEARN" : gameTitle(s.mode).toUpperCase(java.util.Locale.ROOT)), 13, INK);
        label.setTypeface(heavy); meta.addView(label); body.addView(meta);
        progressBar(body, s.index, s.deck.size()); space(body, 8);
        footer.setText("↔  Arrows  Choose       OK  Answer       ↶  Back  Pause       ▷Ⅱ  Replay audio");
        LinearLayout left = column(), right = column();
        if (s.phase == StudySession.Phase.TEACH) {
            left.setBackground(shape(BLUE, BLUE)); picture(left, c.art.isEmpty() ? who + "-wave" : c.art, 254, c.art.isEmpty() || c.kind.equals("noun"));
            eyebrow(right, "MEET YOUR NEXT WORD"); heading(right, c.pt, 34); right.addView(text(c.en, 20, MUTED));
            if (!c.context.isEmpty()) right.addView(text(c.context, 16, GOLD));
            if (!c.why.isEmpty()) right.addView(text(c.why, 17, MUTED));
            right.addView(text("Listen. Say it out loud. Then give it a try.", 16, GOLD)); space(right, 8);
            if (!c.audio.isEmpty()) right.addView(button("listen", "▶  Listen to the Portuguese", () -> listen(c)));
            if (!c.art.isEmpty()) right.addView(button("save-phrase", progress.favourite(c.id) ? "★  Saved" : "☆  Save this phrase", () -> { progress.toggleFavourite(c.id); draw("save-phrase"); }));
            right.addView(primary("practice", "I'm ready  →", () -> { speech.stop(); s.practice(); progress.save(s); draw(null); }));
            split(body, left, right, .30f); return;
        }
        if (s.phase == StudySession.Phase.FEEDBACK) {
            boolean correct = s.wasCorrect(); int colour = correct ? MINT : PEACH;
            left.setBackground(shape(colour, colour)); picture(left, who + (correct ? "-cheer" : "-think"), 248, true);
            eyebrow(right, s.selected < 0 ? "A LITTLE HELP" : correct ? "NICE WORK, " + name.toUpperCase(java.util.Locale.ROOT) : "A CHANCE TO LEARN");
            heading(right, s.selected < 0 ? "Here is the transcript." : correct ? "That's right." : "Let's try that again.", 29);
            right.addView(text("The answer: " + c.answer, 18, INK));
            LinearLayout explanation = column(); explanation.setPadding(dp(14), dp(9), dp(14), dp(9)); explanation.setBackground(shape(PANEL, PANEL));
            heading(explanation, c.pt, 23);
            if (!c.en.isEmpty() && !c.en.equals(c.answer)) explanation.addView(text(c.en, 17, MUTED));
            if (!c.why.isEmpty()) explanation.addView(text(c.why, 17, MUTED)); right.addView(explanation);
            if (!correct && s.selected >= 0) right.addView(text("Your choice: " + s.options().get(s.selected), 14, MUTED));
            if (s.selected < 0) right.addView(text("Skipped listening questions do not earn points. This item is saved for review.", 14, GOLD));
            boolean last = s.index + 1 == s.deck.size() && (s.reviewBuilt || s.missed.isEmpty());
            String next = last ? "See results  →" : s.players == 2 ? "Continue  ·  " + (s.index % 2 == 0 ? "Anna's turn" : "Hadi's turn") : "Continue  →";
            right.addView(primary("continue", next, () -> { speech.stop(); s.next(); progress.save(s); draw(null); }));
            if (!c.audio.isEmpty()) right.addView(button("listen", "▶  Listen to the Portuguese", () -> listen(c)));
            split(body, left, right, .28f); return;
        }
        boolean cafe = c.kind.equals("cafe");
        if (cafe) picture(left, "cafe", 216, false);
        else if (c.kind.equals("dialogue")) picture(left, c.art.isEmpty() ? "conversation" : c.art, 216, false);
        else {
            left.setBackground(shape(audioQuestion ? LILAC : MINT, PANEL));
            left.addView(art.symbol(this, audioQuestion ? "listen" : "grammar"), new LinearLayout.LayoutParams(-1, dp(62)));
            picture(left, who + "-think", 156, true);
        }
        if (audioQuestion) {
            left.addView(primary("listen", "▶  Listen again", () -> listen(c)));
            left.addView(text(cafe ? "Match the items and quantities." : "Replay as often as you like.", 15, MUTED));
            left.addView(button("show-transcript", "Need help? Show transcript", () -> {
                speech.stop(); s.skip(); progress.record(c.id, false); progress.save(s); draw(null);
            }));
            left.addView(text("Transcript help skips this question's score.", 12, MUTED));
        } else left.addView(text(c.kind.equals("dialogue") ? "A real situation. Your reply." : "Read. Think. Choose.", 16, MUTED));
        String prompt = audioQuestion ? (cafe ? c.prompt : "Listen. What did you hear?") : c.prompt;
        heading(right, prompt, cafe ? 23 : 25);
        right.addView(text(audioQuestion ? "Choose what you heard." : c.grammar() ? c.en
            : c.kind.equals("dialogue") ? "Choose the reply that fits." : "Choose the meaning.", 16, MUTED));
        List<String> choices = s.options();
        for (int i = 0; i < choices.size(); i += 2) {
            LinearLayout r = row();
            for (int j = i; j < Math.min(i + 2, choices.size()); j++) {
                final int option = j; String answer = choices.get(j);
                LinearLayout choice = tile("answer-" + j, answer, "Press OK to " + (cafe ? "serve" : "answer"), PANEL, () -> answer(option));
                choice.setPadding(dp(9), dp(6), dp(9), dp(6));
                if (cafe) choice.addView(art.tray(this, answer), new LinearLayout.LayoutParams(-1, dp(82)));
                else eyebrow(choice, new String[]{"A", "B", "C", "D"}[j]);
                TextView value = text(answer, 18, INK); value.setTypeface(heavy); value.setGravity(cafe ? Gravity.CENTER : Gravity.START);
                choice.addView(value); choice.setMinimumHeight(dp(cafe ? 121 : 86));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -2, 1); lp.setMargins(0, dp(4), dp(8), dp(4)); r.addView(choice, lp);
            }
            right.addView(r);
        }
        split(body, left, right, .31f);
    }
    private void listen(StudySession.Card c) {
        speech.play(c.audio, progress.prefs.getBoolean("slow", false), () ->
            notice("This recording could not play. You can use Show transcript, or choose another activity."));
    }
    private void answer(int option) {
        speech.stop();
        if (!session.answer(option)) return;
        progress.record(session.card().id, session.wasCorrect()); progress.save(session); draw(null);
    }
    private void results() {
        StudySession s = session; LinearLayout left = column(), right = column();
        left.setBackground(shape(MINT, MINT));
        if (s.players == 2) {
            LinearLayout people = row(); people.addView(art.character(this, "hadi-cheer"), new LinearLayout.LayoutParams(0, dp(262), 1));
            people.addView(art.character(this, "ana-cheer"), new LinearLayout.LayoutParams(0, dp(262), 1)); left.addView(people);
        } else picture(left, learner() + "-cheer", 262, true);
        eyebrow(right, "LOOK HOW FAR YOU'VE COME"); heading(right, s.players == 2 ? "Better, together." : "A little more Portuguese.", 29);
        heading(right, s.correct + " / " + s.firstCount, 48); right.addView(text("Correct on your first try. A lovely start.", 17, MUTED));
        int pending = 0; for (StudySession.Card c : s.deck.subList(0, s.firstCount)) if (progress.missed(c.id)) pending++;
        right.addView(text(pending == 0 ? "All items answered correctly. Well done!" : pending + " items ready for another try.", 17, GOLD));
        if (!s.lessonId.isEmpty()) {
            Catalog.Lesson l = catalog.lesson(s.lessonId);
            if (l != null) {
                int learned = progress.learned(l); right.addView(text(learned + " / " + l.cards.size() + " lesson items practised", 15, MUTED));
                right.addView(primary("next-batch", learned < l.cards.size() ? "Continue this lesson  →" : "Practise again", () -> startLesson(l)));
            }
        } else right.addView(primary("again", "Practise again  →", () -> { session = s.restart(); progress.save(session); draw(null); }));
        right.addView(text("Recall on later days builds memory. Correct items return for scheduled revision.", 13, MUTED));
        right.addView(button("finish", "Back to Home", () -> { session = null; progress.save(null); navigate("home"); }));
        split(body, left, right, .37f);
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
            case "phrase": navigate("phrasebook"); break;
            case "lesson": navigate("lessons"); break;
            case "lessons": navigate("units"); break;
            case "intro": navigate("games"); break;
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
        state.putString("topic", topicId); state.putInt("phrase", phraseIndex);
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
        if (screen.equals("session")) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        backgrounded = false;
    }
    @Override protected void onDestroy() { if (speech != null) speech.stop(); if (modal != null) modal.dismiss(); super.onDestroy(); }
}
