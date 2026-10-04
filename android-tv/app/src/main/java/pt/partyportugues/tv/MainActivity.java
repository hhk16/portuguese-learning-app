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
    private static final int BG = Color.rgb(16, 29, 35), PANEL = Color.rgb(27, 44, 51),
        INK = Color.rgb(248, 241, 229), MUTED = Color.rgb(177, 194, 195),
        ACCENT = Color.rgb(197, 239, 154), GOLD = Color.rgb(233, 185, 130);
    private Catalog catalog;
    private ProgressStore progress;
    private Speech speech;
    private StudySession session;
    private String screen = "home", unitId = "", lessonId = "", gameId = "dialogue";
    private LinearLayout root, body;
    private TextView footer;
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
        if (state != null) {
            screen = state.getString("screen", "home"); unitId = state.getString("unit", "");
            lessonId = state.getString("lesson", ""); gameId = state.getString("game", "dialogue");
        }
        showLoading();
        // Parse the local catalogue away from the UI thread; even first launch is offline.
        new Thread(() -> {
            try {
                Catalog loaded = Catalog.load(this);
                runOnUiThread(() -> {
                    if (isFinishing() || isDestroyed()) return;
                    catalog = loaded; session = progress.restore(catalog);
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
        t.setFontFeatureSettings("kern"); t.setPadding(0, dp(5), 0, dp(5)); return t;
    }
    private void title(String value, String subtitle) {
        TextView h = text(value, 30, INK); h.setTypeface(null, Typeface.BOLD); body.addView(h);
        if (!subtitle.isEmpty()) body.addView(text(subtitle, 18, MUTED));
        space(body, 12);
    }
    private void space(LinearLayout parent, int height) { View v = new View(this); parent.addView(v, new LinearLayout.LayoutParams(1, dp(height))); }
    private GradientDrawable shape(int fill, int stroke) {
        GradientDrawable d = new GradientDrawable(); d.setColor(fill); d.setCornerRadius(dp(12));
        d.setStroke(dp(2), stroke); return d;
    }
    private Button button(String key, String label, Runnable click) {
        Button b = new Button(this); b.setTag(key); b.setId(View.generateViewId()); b.setText(label);
        b.setAllCaps(false); b.setTextSize(20); b.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
        b.setMinHeight(dp(58)); b.setMinimumHeight(dp(58)); b.setPadding(dp(18), dp(10), dp(18), dp(10));
        b.setStateListAnimator(null); b.setMaxLines(4); b.setEllipsize(TextUtils.TruncateAt.END);
        StateListDrawable bg = new StateListDrawable();
        bg.addState(new int[]{android.R.attr.state_focused}, shape(ACCENT, INK));
        bg.addState(new int[]{android.R.attr.state_pressed}, shape(ACCENT, INK));
        bg.addState(new int[]{}, shape(PANEL, PANEL)); b.setBackground(bg);
        b.setTextColor(new ColorStateList(new int[][]{ new int[]{android.R.attr.state_focused}, new int[]{} }, new int[]{BG, INK}));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2); lp.setMargins(dp(2), dp(4), dp(2), dp(6)); b.setLayoutParams(lp);
        b.setOnClickListener(v -> click.run()); b.setFocusable(true);
        if (firstAction == null) firstAction = b;
        return b;
    }
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
        if (screen.equals("units") || screen.equals("lessons") || screen.equals("lesson")) return "units";
        if (screen.equals("games") || screen.equals("intro")) return "games";
        return screen;
    }
    private void draw(String focusKey) {
        if (catalog == null) return;
        firstAction = null; boolean inSession = screen.equals("session") && session != null;
        getWindow().setFlags(inSession ? WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON : 0, WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        root = column(); root.setBackgroundColor(BG);
        densityPadding = progress.prefs.getBoolean("safeArea", true) ? 28 : 16;
        root.setPadding(dp(densityPadding), dp(densityPadding - 8), dp(densityPadding), dp(densityPadding - 8));
        LinearLayout frame = row(); root.addView(frame, new LinearLayout.LayoutParams(-1, 0, 1));
        if (!inSession) {
            LinearLayout sidebar = column(); sidebar.setPadding(0, dp(4), dp(22), 0);
            frame.addView(sidebar, new LinearLayout.LayoutParams(dp(178), -1));
            TextView brand = text("PARTY\nPORTUGUÊS", 22, ACCENT); brand.setTypeface(null, Typeface.BOLD); sidebar.addView(brand);
            sidebar.addView(text("European Portuguese", 14, MUTED)); space(sidebar, 22);
            String[] ids = {"home", "units", "games", "progress", "settings"};
            String[] names = {"Home", "Lessons", "Play & practise", "Your progress", "Settings"};
            for (int i = 0; i < ids.length; i++) {
                final String dest = ids[i];
                Button nav = button("nav-" + dest, (navGroup().equals(dest) ? "•  " : "") + names[i], () -> navigate(dest));
                nav.setTextSize(17); sidebar.addView(nav);
            }
            firstAction = null;
        }
        ScrollView scroll = new ScrollView(this); scroll.setFillViewport(true); scroll.setClipToPadding(false);
        scroll.setVerticalScrollBarEnabled(false); scroll.setFocusable(false); scroll.setDescendantFocusability(ViewGroup.FOCUS_AFTER_DESCENDANTS);
        frame.addView(scroll, new LinearLayout.LayoutParams(0, -1, 1));
        body = column(); body.setPadding(dp(6), 0, dp(6), dp(12)); scroll.addView(body);
        footer = text("↑ ↓ ← →  Move     OK  Choose     Back  Previous screen", 15, MUTED); root.addView(footer);
        switch (screen) {
            case "units": units(); break;
            case "lessons": lessons(); break;
            case "lesson": lesson(); break;
            case "games": games(); break;
            case "intro": introduction(); break;
            case "progress": stats(); break;
            case "settings": settings(); break;
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
        title("A little Portuguese. Every day.", "Clear lessons and games, at your own pace. Your remote is all you need.");
        if (session != null && session.phase != StudySession.Phase.RESULT) {
            add("resume", "Continue your session  →", () -> { screen = "session"; draw(null); });
        }
        Catalog.Lesson next = catalog.lessons.get(0);
        for (Catalog.Lesson l : catalog.lessons) if (progress.learned(l) < l.cards.size()) { next = l; break; }
        final Catalog.Lesson chosen = next;
        body.addView(text("UP NEXT  ·  A1 COURSE", 16, GOLD));
        add("next-lesson", chosen.title + "\n" + progress.learned(chosen) + " / " + chosen.cards.size() + " items practised correctly", () -> {
            lessonId = chosen.id; unitId = chosen.unit; navigate("lesson");
        });
        pair("browse", "Browse lessons", () -> navigate("units"), "play", "Play together", () -> navigate("games"));
        body.addView(text("Small sessions. Useful language.", 22, INK));
        body.addView(text("Learn a few words, try them, and revisit any mistakes.\nPlay alone or take turns with someone beside you.", 18, MUTED));
    }
    private void units() {
        title("Your Portuguese course", "Choose a chapter. Every lesson is available offline.");
        List<Catalog.Unit> us = catalog.units;
        for (int i = 0; i < us.size(); i += 2) {
            Catalog.Unit u = us.get(i);
            Runnable a = () -> { unitId = u.id; navigate("lessons"); };
            if (i + 1 < us.size()) {
                Catalog.Unit v = us.get(i + 1);
                pair("unit-" + u.id, u.label + "\n" + u.title, a, "unit-" + v.id, v.label + "\n" + v.title,
                    () -> { unitId = v.id; navigate("lessons"); });
            } else add("unit-" + u.id, u.title, a);
        }
    }
    private void lessons() {
        Catalog.Unit u = null; for (Catalog.Unit item : catalog.units) if (item.id.equals(unitId)) u = item;
        title(u == null ? "Lessons" : u.title, u == null ? "" : u.subtitle);
        for (Catalog.Lesson l : catalog.lessons) if (l.unit.equals(unitId)) {
            int n = progress.learned(l);
            add("lesson-" + l.id, l.title + "\n" + n + " / " + l.cards.size() + (n == l.cards.size() ? "  ·  Completed" : "  ·  Keep learning"),
                () -> { lessonId = l.id; navigate("lesson"); });
        }
    }
    private void lesson() {
        Catalog.Lesson l = catalog.lesson(lessonId); if (l == null) { screen = "units"; units(); return; }
        title(l.title, "Learn up to 8 items at a time. No time limit.");
        body.addView(text("1   Read the Portuguese and its meaning. Listen if a recording is available.\n2   Choose an answer with the arrows, then press OK.\n3   Read the explanation. Choose Continue when you are ready.", 19, INK));
        body.addView(text("Any mistakes return once for another try. Your place is saved after each answer.", 17, MUTED));
        add("start-lesson", "Start learning  →", () -> startLesson(l));
        int count = 0;
        for (StudySession.Card c : l.cards) {
            if (count++ == 3) break;
            body.addView(text(c.pt + (c.en.isEmpty() ? "" : "  ·  " + c.en), 19, MUTED));
        }
    }
    private void startLesson(Catalog.Lesson l) {
        List<StudySession.Card> deck = new ArrayList<>();
        for (StudySession.Card c : l.cards) if (!progress.known(c.id)) deck.add(c);
        if (deck.isEmpty()) deck.addAll(l.cards);
        start("learn", l.id, deck, 1);
    }
    private void games() {
        title("Play with a purpose", "Solo or together. Four clear activities. No race against a clock.");
        pair("game-dialogue", "Choose the reply\nHandle an everyday conversation", () -> intro("dialogue"),
            "game-cafe", "At the café\nHear an order. Choose the tray.", () -> intro("cafe"));
        pair("game-listen", "Listen & find\nHear Portuguese. Find the meaning.", () -> intro("listen"),
            "game-grammar", "Complete the sentence\nChoose the word that fits", () -> intro("grammar"));
        int misses = 0; for (String id : catalog.cards.keySet()) if (progress.missed(id)) misses++;
        if (misses > 0) add("review", "Review your mistakes  ·  " + misses + " items", () -> intro("review"));
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
            default: return "Read the situation and what the other person says.\nChoose the Portuguese reply that fits that specific situation.\nAfter each answer, see why the reply works.";
        }
    }
    private void introduction() {
        title(gameTitle(gameId), "THE GOAL  ·  Practise useful Portuguese, one choice at a time.");
        body.addView(text(rules(gameId), 20, INK)); space(body, 10);
        String example;
        switch (gameId) {
            case "cafe": example = "EXAMPLE  ·  Queria dois cafés, por favor. → Choose 2 coffees."; break;
            case "listen": example = "EXAMPLE  ·  Hear Olá! → Choose Hi!"; break;
            case "grammar": example = "EXAMPLE  ·  Nós ___ portugueses. → Choose somos."; break;
            case "review": example = "A correction explains the answer. You can replay available audio."; break;
            default: example = "EXAMPLE  ·  Como te chamas? → Chamo-me Ana.";
        }
        body.addView(text(example, 18, ACCENT));
        body.addView(text("CONTROLS  ·  Arrows to choose, OK to answer. Back pauses.\n8 questions. Mistakes return once. Continue advances when you are ready.", 18, MUTED));
        body.addView(text("Together: pass the remote after each turn. Work toward a shared score.", 18, GOLD));
        pair("solo", "Play solo  →", () -> startGame(1), "together", "Play together  →", () -> startGame(2));
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
        String turn = s.players == 2 ? "PLAYER " + (s.index % 2 + 1) + "  ·  " : "";
        String step = s.index >= s.firstCount ? "RETRY " + (s.index - s.firstCount + 1) + " / " + s.missed.size()
            : "QUESTION " + (s.index + 1) + " / " + s.firstCount;
        body.addView(text(turn + step + "   ·   " + (s.mode.equals("learn") ? "LEARN" : gameTitle(s.mode).toUpperCase(java.util.Locale.ROOT)), 16, GOLD));
        ProgressBar bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(s.deck.size()); bar.setProgress(s.index); bar.setProgressTintList(ColorStateList.valueOf(ACCENT));
        body.addView(bar, new LinearLayout.LayoutParams(-1, dp(5))); space(body, 10);
        footer.setText("↑ ↓ ← →  Move     OK  Choose     Back  Pause     Play/Pause  Replay audio");
        if (s.phase == StudySession.Phase.TEACH) {
            title(c.pt, c.en);
            if (!c.why.isEmpty()) body.addView(text(c.why, 20, MUTED));
            body.addView(text("Read it. Say it out loud. Then try a question.", 18, GOLD));
            if (!c.audio.isEmpty()) pair("listen", "Listen", () -> listen(c), "practice", "Try it  →", () -> { speech.stop(); s.practice(); progress.save(s); draw(null); });
            else add("practice", "Try it  →", () -> { s.practice(); progress.save(s); draw(null); });
            return;
        }
        if (s.phase == StudySession.Phase.FEEDBACK) {
            title(s.selected < 0 ? "Here is the transcript." : s.wasCorrect() ? "That's right." : "Let's try that again.", "The answer: " + c.answer);
            body.addView(text(c.pt, 25, INK));
            if (!c.en.isEmpty() && !c.en.equals(c.answer)) body.addView(text(c.en, 20, MUTED));
            if (!c.why.isEmpty()) body.addView(text(c.why, 20, MUTED));
            if (!s.wasCorrect() && s.selected >= 0) body.addView(text("Your choice: " + s.options().get(s.selected), 18, GOLD));
            if (s.selected < 0) body.addView(text("Skipped listening questions do not earn points. This item is saved for review.", 18, GOLD));
            boolean last = s.index + 1 == s.deck.size() && (s.reviewBuilt || s.missed.isEmpty());
            String label = last ? "See results  →" : s.players == 2 ? "Continue  ·  Pass the remote to Player " + ((s.index + 1) % 2 + 1) : "Continue →";
            add("continue", label, () -> { speech.stop(); s.next(); progress.save(s); draw(null); });
            if (!c.audio.isEmpty()) add("listen", "Listen to the Portuguese", () -> listen(c));
            return;
        }
        String prompt = audioQuestion ? (c.kind.equals("cafe") ? c.prompt : "Listen. What did you hear?") : c.prompt;
        title(prompt, audioQuestion ? "Use Listen, then choose an answer. Replay as often as you need."
            : c.grammar() ? c.en : c.kind.equals("dialogue") ? "Choose the reply that fits this situation." : "Choose the meaning.");
        if (audioQuestion) add("listen", "Listen to the question", () -> listen(c));
        List<String> choices = s.options();
        for (int i = 0; i < choices.size(); i += 2) {
            final int x = i; String label = choices.get(i);
            if (i + 1 < choices.size()) {
                final int y = i + 1;
                pair("answer-" + x, label, () -> answer(x), "answer-" + y, choices.get(y), () -> answer(y));
            } else add("answer-" + x, label, () -> answer(x));
        }
        if (audioQuestion) add("show-transcript", "Show transcript  ·  Skip scoring this question", () -> {
            // An accessibility fallback never counts as a correct listening answer.
            speech.stop(); s.skip(); progress.record(c.id, false); progress.save(s); draw(null);
        });
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
        StudySession s = session;
        title(s.players == 2 ? "A good session, together." : "Session complete.", "You took time to practise. Keep going at your own pace.");
        TextView score = text(s.correct + " / " + s.firstCount, 48, ACCENT); score.setTypeface(null, Typeface.BOLD); body.addView(score);
        body.addView(text("Correct on your first try. Retries do not inflate your score.", 18, MUTED));
        int left = 0; for (StudySession.Card c : s.deck.subList(0, s.firstCount)) if (progress.missed(c.id)) left++;
        body.addView(text(left == 0 ? "All items in this session answered correctly." : left + " items saved for review.", 21, GOLD));
        if (!s.lessonId.isEmpty()) {
            Catalog.Lesson l = catalog.lesson(s.lessonId);
            if (l != null) {
                int learned = progress.learned(l);
                body.addView(text(learned + " / " + l.cards.size() + " lesson items practised correctly", 18, MUTED));
                add("next-batch", learned < l.cards.size() ? "Continue this lesson  →" : "Practise this lesson again", () -> startLesson(l));
            }
        } else add("again", "Play again", () -> { session = s.restart(); progress.save(session); draw(null); });
        add("finish", "Back to Home", () -> { session = null; progress.save(null); navigate("home"); });
    }
    private void stats() {
        int complete = 0, known = 0, missed = 0;
        for (Catalog.Lesson l : catalog.lessons) if (progress.learned(l) == l.cards.size()) complete++;
        for (String id : catalog.cards.keySet()) { if (progress.known(id)) known++; if (progress.missed(id)) missed++; }
        title("Your progress", "Saved on this TV. Correct practice is progress; a score is not a fluency certificate.");
        body.addView(text(known + " items answered correctly   ·   " + complete + " lessons completed", 24, ACCENT));
        body.addView(text(missed + " items to revisit", 22, GOLD));
        if (missed > 0) add("review", "Review your mistakes  →", () -> intro("review"));
        add("browse", "Continue learning", () -> navigate("units"));
        body.addView(text("Together sessions share this TV's progress. They do not measure each person's mastery separately.", 17, MUTED));
    }
    private void settings() {
        title("Make yourself comfortable", "European Portuguese recordings are bundled with the app.");
        boolean slow = progress.prefs.getBoolean("slow", false), safe = progress.prefs.getBoolean("safeArea", true);
        add("slow", "Speech speed  ·  " + (slow ? "Slower" : "Normal"), () -> { progress.prefs.edit().putBoolean("slow", !slow).apply(); draw("slow"); });
        add("safe", "Screen margins  ·  " + (safe ? "TV safe area" : "Compact"), () -> { progress.prefs.edit().putBoolean("safeArea", !safe).apply(); draw("safe"); });
        body.addView(text("No account, phone, or internet connection is needed.\nUse your remote's volume buttons to adjust the speech.", 18, MUTED));
        add("reset", "Reset learning progress…", () -> {
            modal = new AlertDialog.Builder(this).setTitle("Reset this TV's learning progress?")
                .setMessage("This removes your saved session and answers. It cannot be undone.")
                .setNegativeButton("Keep progress", null).setPositiveButton("Reset progress", (d, w) -> {
                    progress.prefs.edit().remove("evidence").remove("session").apply(); progress = new ProgressStore(this); session = null; draw("reset");
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
        if (code == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE && session != null && screen.equals("session")) {
            if (event.getAction() == KeyEvent.ACTION_UP) listen(session.card()); return true;
        }
        return super.dispatchKeyEvent(event);
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        state.putString("screen", screen); state.putString("unit", unitId); state.putString("lesson", lessonId); state.putString("game", gameId);
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
