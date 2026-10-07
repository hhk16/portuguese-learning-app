package pt.partyportugues.tv;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/** Pure learning state. No timers: only deliberate OK presses advance a session. */
public final class StudySession {
    public enum Phase { TEACH, QUESTION, FEEDBACK, RESULT }
    public static final class Card {
        public final String id, kind, pt, en, prompt, answer, why, audio;
        public final List<String> options;
        public String art = "", context = "";
        public String teachPt, teachEn, speechText, grammarHint = "", examplePt = "", exampleEn = "";
        public String heardEn = "", heardAudio = "", followup = "", followupEn = "", followupAudio = "";
        public Card(String id, String kind, String pt, String en, String prompt,
                    String answer, String why, String audio, List<String> options) {
            this.id = id; this.kind = kind; this.pt = pt; this.en = en;
            this.teachPt = pt; this.teachEn = en; this.speechText = pt;
            this.prompt = prompt; this.answer = answer; this.why = why; this.audio = audio;
            this.options = Collections.unmodifiableList(new ArrayList<>(options));
        }
        public boolean grammar() {
            return kind.equals("frame") || kind.equals("error") || kind.equals("conjugation")
                || kind.equals("contraction") || kind.equals("origin");
        }
    }
    public final String mode, lessonId;
    public final long seed;
    public final List<Card> deck;
    public final List<Card> missed = new ArrayList<>();
    public int index, correct, selected = -1;
    public final int firstCount;
    public boolean reviewBuilt;
    public int players = 1;
    public Phase phase;
    public CafeOrder tray = new CafeOrder();
    public boolean assisted, traySubmitted, trayCorrect;
    public int assistedCorrect;
    public boolean batchTeaching;
    public int teachIndex, pendingOption = -1;
    public int choiceRule = 2, topicOffset, topicLength;
    public String topicId = "";

    public StudySession(String mode, String lessonId, List<Card> cards, long seed) {
        this(mode, lessonId, cards, seed, cards.size());
    }
    public StudySession(String mode, String lessonId, List<Card> cards, long seed, int firstCount) {
        if (cards.isEmpty()) throw new IllegalArgumentException("A session needs cards");
        this.mode = mode; this.lessonId = lessonId; this.seed = seed;
        this.deck = new ArrayList<>(cards); this.firstCount = firstCount;
        batchTeaching = mode.equals("learn") || mode.equals("listen") || mode.equals("conversation");
        phase = batchTeaching || mode.equals("cafe") ? Phase.TEACH : Phase.QUESTION;
    }
    /** Teach a contrast alongside singleton/mixed remainders so every choice is familiar. */
    public static List<Card> withTaughtContrast(List<Card> items, List<Card> related) {
        List<Card> batch = new ArrayList<>(items); List<String> meanings = new ArrayList<>(); Card target = null;
        for (Card c : batch) if (!c.grammar() && !c.kind.equals("conversation") && !c.kind.equals("minimalPair")) {
            if (!meanings.contains(c.answer)) meanings.add(c.answer); target = c;
        }
        if (meanings.size() == 1 && target != null) for (Card c : related) if (c.kind.equals(target.kind) && !c.answer.equals(target.answer)) {
            if (batch.size() == 4) { int remove = 3; for (int i = 3; i >= 0; i--) if (batch.get(i).grammar()) { remove = i; break; } batch.remove(remove); }
            batch.add(c); break;
        }
        return batch;
    }
    public static int batchSize(int remaining) { return remaining == 5 ? 3 : Math.min(4, remaining); }
    public Card card() { return deck.get(Math.min(phase == Phase.TEACH && batchTeaching ? teachIndex : index, deck.size() - 1)); }
    public List<String> options() {
        Card c = card();
        List<String> rest = new ArrayList<>(c.options);
        if (batchTeaching && !c.kind.equals("conversation") && !c.kind.equals("minimalPair") && (choiceRule == 1 || !c.grammar())) {
            List<String> taught = new ArrayList<>();
            for (Card other : deck.subList(0, firstCount)) if ((choiceRule == 1 ? other.kind.equals(c.kind) && rest.contains(other.answer) : !other.grammar() && !other.kind.equals("conversation") && !other.kind.equals("minimalPair")) && !taught.contains(other.answer)) taught.add(other.answer);
            if (choiceRule >= 2 || taught.size() >= 2) rest = taught;
        }
        rest.remove(c.answer);
        Collections.shuffle(rest, new Random(seed ^ c.id.hashCode() ^ index));
        List<String> out = new ArrayList<>();
        out.add(c.answer);
        out.addAll(rest.subList(0, Math.min(3, rest.size())));
        Collections.shuffle(out, new Random(seed + index * 31L));
        return out;
    }
    public void practice() {
        if (phase != Phase.TEACH) return;
        if (batchTeaching && teachIndex + 1 < firstCount) teachIndex++;
        else phase = Phase.QUESTION;
    }
    public void help() { if (phase == Phase.QUESTION) assisted = true; }
    public boolean guidedOrder() { return mode.equals("cafe") && index == 0; }
    public int independentCount() { return mode.equals("cafe") ? Math.max(0, firstCount - 1) : firstCount; }
    public boolean submitTray() {
        if (!mode.equals("cafe") || phase != Phase.QUESTION || tray.total() == 0) return false;
        traySubmitted = true; trayCorrect = tray.matches(card().answer);
        if (index < firstCount) {
            if (trayCorrect && !guidedOrder() && !assisted) correct++;
            else if (!guidedOrder() && assisted && trayCorrect) assistedCorrect++;
            if (!trayCorrect || (!guidedOrder() && assisted)) missed.add(card());
        }
        phase = Phase.FEEDBACK; return true;
    }
    /** A held remote button or duplicate click can never record an answer twice. */
    public boolean answer(int option) {
        if (mode.equals("cafe") || phase != Phase.QUESTION || option < 0 || option >= options().size()) return false;
        selected = option;
        boolean right = options().get(option).equals(card().answer);
        if (index < firstCount) {
            if (right && !assisted) correct++;
            if (right && assisted) assistedCorrect++;
            if (!right || assisted) missed.add(card());
        }
        phase = Phase.FEEDBACK;
        return true;
    }
    public boolean wasCorrect() {
        if (mode.equals("cafe") && traySubmitted) return trayCorrect;
        return selected >= 0 && selected < options().size() && options().get(selected).equals(card().answer);
    }
    public void skip() {
        if (phase != Phase.QUESTION) return;
        selected = -1;
        pendingOption = -1;
        if (index < firstCount) missed.add(card());
        phase = Phase.FEEDBACK;
    }
    public void next() {
        if (phase != Phase.FEEDBACK) return;
        index++;
        selected = -1; pendingOption = -1;
        tray.clear(); assisted = false; traySubmitted = false; trayCorrect = false;
        if (index == firstCount && !reviewBuilt) {
            deck.addAll(missed); // One retry of each miss; mistakes never create an endless game.
            reviewBuilt = true;
        }
        if (index >= deck.size()) phase = Phase.RESULT;
        else phase = mode.equals("learn") && !batchTeaching && index < firstCount ? Phase.TEACH : Phase.QUESTION;
    }
    public StudySession restart() {
        StudySession s = new StudySession(mode, lessonId, deck.subList(0, firstCount), seed);
        s.players = players; s.choiceRule = choiceRule; s.topicId = topicId; s.topicOffset = topicOffset; s.topicLength = topicLength;
        return s;
    }
}
