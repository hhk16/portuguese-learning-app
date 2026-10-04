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
        String[] names = {"testRemoteFocusAndLesson", "testGameRulesTurnsAndTranscript", "testSavedSessionSurvivesRelaunch", "testNativeOfflineAndExitGuard", "testEveryGameHasInstructionsAndRemoteChoices", "testReviewIncludesNativeGames", "testArtworkAndNamedPlayers"};
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
        waitFor(tag); getInstrumentation().runOnMainSync(() -> find(tag).requestFocus());
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
        // UI-thread idle can precede the compositor presenting the new native screen.
        SystemClock.sleep(350);
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
    public void testArtworkAndNamedPlayers() throws Exception {
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
