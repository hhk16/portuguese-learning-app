package pt.partyportugues.tv;

import android.content.Intent;
import android.graphics.Bitmap;
import android.os.SystemClock;
import android.app.Instrumentation;
import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import java.io.File;
import java.io.FileOutputStream;

/** Exercise the native Activity with real remote key events on a TV emulator. */
public class TvFlowTest extends Instrumentation {
    private MainActivity activity;
    private Instrumentation getInstrumentation() { return this; }
    @Override public void onCreate(Bundle args) { super.onCreate(args); start(); }
    @Override public void onStart() {
        String[] names = {"testRemoteFocusAndLesson", "testGameRulesTurnsAndTranscript", "testSavedSessionSurvivesRelaunch", "testNativeOfflineAndExitGuard", "testEveryGameHasInstructionsAndRemoteChoices", "testReviewIncludesNativeGames", "testArtworkAndNamedPlayers", "testPhrasebookAudioSavedAndPractice", "testScheduledRevision", "testPictureWorldsLearnListenAndResume"};
        int failures = 0;
        for (int i = 0; i < names.length; i++) {
            Bundle status = new Bundle(); status.putString("id", "NativeTvTests");
            status.putString("class", getClass().getName()); status.putString("test", names[i]);
            status.putInt("numtests", names.length); status.putInt("current", i + 1); sendStatus(1, status);
            try {
                setUp(); getClass().getMethod(names[i]).invoke(this);
                status.putString("stream", "."); sendStatus(0, status);
            } catch (Throwable error) {
                failures++; Throwable cause = error.getCause() == null ? error : error.getCause();
                status.putString("stack", android.util.Log.getStackTraceString(cause));
                status.putString("stream", "\n" + android.util.Log.getStackTraceString(cause)); sendStatus(-2, status);
            } finally { try { tearDown(); } catch (Exception ignored) { } }
        }
        Bundle result = new Bundle(); result.putString("stream", "\nTests run: " + names.length + ", failures: " + failures + "\n");
        finish(Activity.RESULT_OK, result);
    }
    private static void assertTrue(boolean condition) { if (!condition) throw new AssertionError("Expected true"); }
    private static void assertFalse(boolean condition) { assertFalse("Expected false", condition); }
    private static void assertFalse(String message, boolean condition) { if (condition) throw new AssertionError(message); }
    private static void assertNotNull(Object value) { assertNotNull("Expected non-null", value); }
    private static void assertNotNull(String message, Object value) { if (value == null) throw new AssertionError(message); }
    private static void assertNotSame(Object a, Object b) { if (a == b) throw new AssertionError("Focus did not move"); }
    private static void assertEquals(Object a, Object b) { if (!a.equals(b)) throw new AssertionError("Values differ"); }
    private void setUp() {
        getInstrumentation().getTargetContext().getSharedPreferences("native-learning-v1", 0).edit().clear().commit();
        launch();
    }
    private void launch() {
        Intent intent = new Intent(getInstrumentation().getTargetContext(), MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity = (MainActivity) getInstrumentation().startActivitySync(intent);
        waitFor("next-lesson");
    }
    private View find(String tag) { return activity.getWindow().getDecorView().findViewWithTag(tag); }
    private void waitFor(String tag) {
        long end = SystemClock.uptimeMillis() + 10000;
        while (find(tag) == null && SystemClock.uptimeMillis() < end) SystemClock.sleep(50);
        getInstrumentation().waitForIdleSync(); assertNotNull("Missing action: " + tag + "\n" + describe(activity.getWindow().getDecorView()), find(tag));
    }
    private String describe(View v) {
        String out = v instanceof TextView ? ((TextView) v).getText().toString() + "\n" : "";
        if (v instanceof ViewGroup) for (int i = 0; i < ((ViewGroup) v).getChildCount(); i++) out += describe(((ViewGroup) v).getChildAt(i));
        return out;
    }
    private void press(String tag) {
        waitFor(tag);
        // Dialog dismissal can leave the Activity window briefly without input focus.
        // UI-thread idle alone does not mean WindowManager has returned the remote.
        long focusDeadline = SystemClock.uptimeMillis() + 3000;
        while (!activity.hasWindowFocus() && SystemClock.uptimeMillis() < focusDeadline) SystemClock.sleep(20);
        assertTrue(activity.hasWindowFocus());
        getInstrumentation().runOnMainSync(() -> find(tag).requestFocus());
        getInstrumentation().sendKeyDownUpSync(KeyEvent.KEYCODE_DPAD_CENTER); getInstrumentation().waitForIdleSync();
    }
    private boolean contains(View view, String value) {
        if (view instanceof TextView && ((TextView) view).getText().toString().contains(value)) return true;
        if (view instanceof ViewGroup) for (int i = 0; i < ((ViewGroup) view).getChildCount(); i++)
            if (contains(((ViewGroup) view).getChildAt(i), value)) return true;
        return false;
    }
    private void screenshot(String name) throws Exception {
        getInstrumentation().waitForIdleSync();
        // Wait for a rendered frame, rather than mistaking UI-thread idle for presentation.
        java.util.concurrent.CountDownLatch frame = new java.util.concurrent.CountDownLatch(1);
        getInstrumentation().runOnMainSync(() -> {
            View view = activity.getWindow().getDecorView();
            if (android.os.Build.VERSION.SDK_INT >= 29 && view.isHardwareAccelerated()) {
                view.getViewTreeObserver().registerFrameCommitCallback(frame::countDown); view.invalidate();
            } else view.postDelayed(frame::countDown, 500);
        });
        frame.await(3, java.util.concurrent.TimeUnit.SECONDS);
        SystemClock.sleep(200);
        File folder = new File(getInstrumentation().getTargetContext().getExternalFilesDir(null), "screenshots"); folder.mkdirs();
        Bitmap shot = getInstrumentation().getUiAutomation().takeScreenshot();
        if (shot != null) try (FileOutputStream out = new FileOutputStream(new File(folder, name + ".png"))) {
            shot.compress(Bitmap.CompressFormat.PNG, 100, out); shot.recycle();
        }
    }
    public void testRemoteFocusAndLesson() throws Exception {
        screenshot("home");
        View before = activity.getCurrentFocus();
        getInstrumentation().sendKeyDownUpSync(KeyEvent.KEYCODE_DPAD_DOWN);
        getInstrumentation().waitForIdleSync(); assertNotSame(before, activity.getCurrentFocus());
        press("next-lesson"); screenshot("lesson-intro"); press("start-lesson");
        screenshot("teaching"); press("practice"); waitFor("answer-0"); screenshot("question");
        press("answer-0"); waitFor("continue"); screenshot("feedback");
        SystemClock.sleep(1200); assertNotNull("Feedback must wait for Continue", find("continue"));
        getInstrumentation().sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); getInstrumentation().waitForIdleSync();
        assertFalse("Back must pause instead of finishing", activity.isFinishing()); screenshot("pause");
        getInstrumentation().sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); getInstrumentation().waitForIdleSync();
        press("continue"); waitFor("practice");
    }
    public void testGameRulesTurnsAndTranscript() throws Exception {
        press("nav-games"); screenshot("games"); press("game-cafe"); screenshot("cafe-instructions");
        assertTrue(contains(activity.getWindow().getDecorView(), "both the food and the quantities"));
        press("together"); waitFor("listen"); screenshot("cafe-question");
        press("listen"); SystemClock.sleep(300); assertTrue(activity.hasWindowFocus());
        assertTrue(contains(activity.getWindow().getDecorView(), "PLAYER 1"));
        press("show-transcript");
        assertTrue(contains(activity.getWindow().getDecorView(), "Skipped listening questions do not earn points"));
        press("continue"); assertTrue(contains(activity.getWindow().getDecorView(), "PLAYER 2"));
        assertTrue(contains(activity.getWindow().getDecorView(), "Anna")); screenshot("anna-turn");
    }
    public void testSavedSessionSurvivesRelaunch() throws Exception {
        press("next-lesson"); press("start-lesson"); press("practice"); press("answer-0");
        String state = getInstrumentation().getTargetContext().getSharedPreferences("native-learning-v1", 0).getString("session", "");
        assertTrue(state.contains("FEEDBACK"));
        closeActivity();
        launch(); press("resume"); waitFor("continue");
        assertEquals(state, getInstrumentation().getTargetContext().getSharedPreferences("native-learning-v1", 0).getString("session", ""));
    }
    public void testNativeOfflineAndExitGuard() throws Exception {
        String[] permissions = getInstrumentation().getTargetContext().getPackageManager()
            .getPackageInfo("pt.partyportugues.tv", android.content.pm.PackageManager.GET_PERMISSIONS).requestedPermissions;
        if (permissions != null) for (String p : permissions) assertFalse(p.equals("android.permission.INTERNET"));
        getInstrumentation().sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); getInstrumentation().waitForIdleSync();
        assertFalse(activity.isFinishing());
        getInstrumentation().sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); getInstrumentation().waitForIdleSync();
        assertNotNull(find("next-lesson"));
        press("nav-units"); screenshot("chapters");
        press("unit-u08"); screenshot("chapter-eight");
        assertTrue(contains(activity.getWindow().getDecorView(), "férias"));
    }
    public void testEveryGameHasInstructionsAndRemoteChoices() throws Exception {
        String[] games = {"dialogue", "listen", "grammar"};
        for (String game : games) {
            press("nav-games"); press("game-" + game);
            assertTrue(contains(activity.getWindow().getDecorView(), "THE GOAL"));
            assertTrue(contains(activity.getWindow().getDecorView(), "CONTROLS"));
            screenshot(game + "-instructions"); press("solo"); waitFor("answer-0"); screenshot(game + "-question");
            press("answer-0"); waitFor("continue");
            closeActivity();
            getInstrumentation().getTargetContext().getSharedPreferences("native-learning-v1", 0).edit().clear().commit();
            launch();
        }
    }
    public void testReviewIncludesNativeGames() throws Exception {
        closeActivity();
        getInstrumentation().getTargetContext().getSharedPreferences("native-learning-v1", 0).edit()
            .remove("session").putString("evidence", "{\"native.dialogue.0\":-1,\"native.cafe.0\":-1}").commit();
        launch(); press("nav-games"); press("review"); press("solo");
        waitFor("answer-0");
        assertTrue(contains(activity.getWindow().getDecorView(), "Como te chamas?"));
        press("answer-0"); press("continue"); waitFor("listen");
        assertTrue(contains(activity.getWindow().getDecorView(), "Which tray matches the order?"));
        assertNotNull(find("show-transcript")); screenshot("cafe-review");
        press("show-transcript"); waitFor("continue");
        assertTrue(contains(activity.getWindow().getDecorView(), "Skipped listening questions do not earn points"));
    }
    public void testPhrasebookAudioSavedAndPractice() throws Exception {
        press("nav-phrasebook"); screenshot("phrasebook");
        press("topic-market");
        assertTrue((activity.getWindow().getAttributes().flags & android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) != 0);
        assertTrue(contains(activity.getWindow().getDecorView(), "Quanto custa?"));
        press("listen"); SystemClock.sleep(400); assertNotNull(find("listen-slow"));
        press("next-phrase"); assertTrue(contains(activity.getWindow().getDecorView(), "Queria duas maçãs"));
        press("listen-slow"); SystemClock.sleep(350); press("save-phrase"); screenshot("market-phrase");
        assertTrue(getInstrumentation().getTargetContext().getSharedPreferences("native-learning-v1", 0).getString("favourites", "").contains("phrase.market.1"));
        closeActivity(); launch(); press("nav-phrasebook"); press("saved-phrases");
        assertTrue(contains(activity.getWindow().getDecorView(), "Queria duas maçãs"));
        press("practise-topic"); waitFor("practice"); screenshot("phrase-teaching");
        press("practice"); press("answer-0"); waitFor("continue"); screenshot("phrase-feedback");
    }
    public void testScheduledRevision() throws Exception {
        closeActivity();
        String id = "phrase.travel.0";
        getInstrumentation().getTargetContext().getSharedPreferences("native-learning-v1", 0).edit()
            .putString("evidence", "{\"" + id + "\":1}")
            .putString("schedule", "{\"" + id + "\":{\"stage\":1,\"due\":1,\"lastSuccess\":1}}") .commit();
        launch(); press("nav-phrasebook"); press("daily-revision"); waitFor("answer-0");
        assertTrue(contains(activity.getWindow().getDecorView(), "Onde fica a estação?")); screenshot("scheduled-revision");
        ProgressStore store = new ProgressStore(getInstrumentation().getTargetContext());
        assertTrue(store.due(id)); store.record(id, true); store.save(null);
        assertFalse(store.due(id)); int stage = store.schedule.getJSONObject(id).getInt("stage");
        assertEquals(2, stage); store.record(id, true); assertEquals(stage, store.schedule.getJSONObject(id).getInt("stage"));
        store.record(id, false); assertTrue(store.due(id));
    }
    public void testArtworkAndNamedPlayers() throws Exception {
        if (android.os.Build.VERSION.SDK_INT >= 28)
            assertTrue(((TextView) find("next-lesson")).getTypeface().getWeight() >= 800);
        for (String name : new String[]{"home", "cafe", "conversation", "coffee", "milk", "bread", "soup", "icecream", "cake", "croissant", "water", "hadi-wave", "ana-wave", "hadi-cheer", "ana-cheer"}) {
            try (java.io.InputStream in = getInstrumentation().getTargetContext().getAssets().open("art/" + name + ".webp")) {
                Bitmap picture = android.graphics.BitmapFactory.decodeStream(in);
                assertNotNull("Missing artwork: " + name, picture);
                assertTrue(picture.getWidth() > 32 && picture.getHeight() > 32);
                if (name.equals("coffee") || name.equals("milk")) assertTrue(android.graphics.Color.alpha(picture.getPixel(0, 0)) == 0);
                picture.recycle();
            }
        }
        press("nav-settings"); press("learner-anna"); screenshot("settings");
        assertTrue(getInstrumentation().getTargetContext().getSharedPreferences("native-learning-v1", 0).getBoolean("anna", false));
        press("nav-home"); press("next-lesson"); press("start-lesson"); screenshot("anna-teaching");
        assertTrue(contains(activity.getWindow().getDecorView(), "Anna"));
        int actions = 0;
        while (find("finish") == null && actions++ < 48) {
            if (find("practice") != null) press("practice");
            else if (find("answer-0") != null) press("answer-0");
            else press("continue");
        }
        waitFor("finish"); screenshot("results"); press("finish");
        press("nav-progress"); screenshot("progress");
    }
    public void testPictureWorldsLearnListenAndResume() throws Exception {
        Catalog catalog = Catalog.load(getInstrumentation().getTargetContext());
        assertEquals(4, catalog.worlds.size()); assertEquals(16, catalog.games.get("picture").size());
        for (Catalog.Topic world : catalog.worlds) for (StudySession.Card card : world.cards) {
            assertEquals(4, new java.util.HashSet<>(card.options).size());
            assertFalse(card.art.isEmpty()); assertFalse(card.audio.isEmpty());
            try (java.io.InputStream in = activity.getAssets().open("art/" + card.art + ".webp")) { assertTrue(in.read() >= 0); }
        }
        press("nav-games"); screenshot("play-skills"); press("game-picture"); screenshot("picture-worlds");
        press("world-animals"); screenshot("park-words"); press("word-picture.animals.gato");
        assertTrue((activity.getWindow().getAttributes().flags & android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) != 0);
        press("learn-world"); screenshot("picture-teaching");
        for (int i = 0; i < 4; i++) {
            waitFor("practice"); press("practice");
            StudySession state = new ProgressStore(activity).restore(catalog);
            assertTrue(contains(activity.getWindow().getDecorView(), "Find: " + state.card().pt));
            press("answer-" + state.options().indexOf(state.card().answer)); press("continue");
        }
        waitFor("finish"); screenshot("picture-result");
        for (StudySession.Card card : catalog.worlds.get(2).cards) assertTrue(new ProgressStore(activity).known(card.id));
        press("finish"); press("nav-games"); press("game-picture"); press("world-travel"); screenshot("transport-words");
        press("match-world"); waitFor("listen");
        StudySession state = new ProgressStore(activity).restore(catalog);
        assertEquals("picture", state.mode);
        assertFalse(contains(activity.getWindow().getDecorView(), state.card().pt));
        assertFalse(contains(activity.getWindow().getDecorView(), state.card().en));
        assertNotNull(find("answer-3")); screenshot("picture-listening"); press("listen");
        String saved = new ProgressStore(activity).prefs.getString("session", "");
        closeActivity(); launch(); press("resume"); waitFor("answer-3");
        assertEquals(saved, new ProgressStore(activity).prefs.getString("session", ""));
        press("show-transcript"); waitFor("continue"); screenshot("picture-correction");
        assertTrue(contains(activity.getWindow().getDecorView(), "Skipped listening questions do not earn points"));
    }
    private void tearDown() {
        closeActivity();
    }
    private void closeActivity() {
        if (activity == null || activity.isDestroyed()) return;
        getInstrumentation().runOnMainSync(() -> activity.finish());
        getInstrumentation().waitForIdleSync();
        long end = SystemClock.uptimeMillis() + 5000;
        while (!activity.isDestroyed() && SystemClock.uptimeMillis() < end) SystemClock.sleep(50);
        assertTrue(activity.isDestroyed());
    }
}
