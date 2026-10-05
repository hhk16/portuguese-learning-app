import pt.partyportugues.tv.StudySession;
import java.util.Arrays;
import java.util.List;

/** Learning behavior checks, independent of Android. Run with assertions enabled. */
public class StudySessionTest {
    static StudySession.Card card(String id) {
        String answer = id.equals("a") ? "Hi!" : "Bye!";
        return new StudySession.Card(id, "phrase", id.equals("a") ? "Olá!" : "Adeus!", answer, "", answer, "", "a.mp3", Arrays.asList("Hi!", "Bye!", "Please."));
    }
    static int choice(StudySession s, boolean correct) {
        List<String> opts = s.options(); int answer = opts.indexOf(s.card().answer);
        return correct ? answer : (answer + 1) % opts.size();
    }
    public static void main(String[] args) {
        StudySession s = new StudySession("learn", "lesson", Arrays.asList(card("a"), card("b")), 12);
        assert s.phase == StudySession.Phase.TEACH && s.card().id.equals("a");
        assert !s.answer(0) : "Teaching must never score";
        s.practice(); assert s.phase == StudySession.Phase.TEACH && s.card().id.equals("b") && s.index == 0;
        assert !s.answer(0) : "All expressions must be introduced before testing";
        s.practice(); assert s.phase == StudySession.Phase.QUESTION && s.card().id.equals("a");
        assert s.options().size() == 2 && !s.options().contains("Please.") : "Use taught meanings when available";
        assert !s.answer(-1) && !s.answer(99);
        assert s.answer(choice(s, false)); assert !s.answer(choice(s, true)) : "Held OK cannot rescore";
        s.next(); assert s.phase == StudySession.Phase.QUESTION && s.card().id.equals("b");
        s.pendingOption = 1; s.help(); assert s.phase == StudySession.Phase.QUESTION;
        s.answer(choice(s, true)); assert s.correct == 0 && s.assistedCorrect == 1;
        s.next(); assert s.deck.size() == 4 && s.index == 2 && !s.assisted && s.pendingOption == -1;
        s.answer(choice(s, false)); s.next(); s.answer(choice(s, true)); s.next();
        assert s.phase == StudySession.Phase.RESULT && s.correct == 0 : "Retries end and never inflate first-try score";
        s.next(); assert s.index == 4;
        s.players = 2; StudySession again = s.restart();
        assert again.deck.size() == 2 && again.players == 2 && again.correct == 0 && again.teachIndex == 0;
        StudySession legacy = new StudySession("learn", "", Arrays.asList(card("a"), card("b")), 42);
        legacy.batchTeaching = false; legacy.practice(); legacy.answer(choice(legacy, true)); legacy.next();
        assert legacy.phase == StudySession.Phase.TEACH && legacy.card().id.equals("b") : "Old saved lessons preserve their flow";
        StudySession oldSkip = new StudySession("listen", "", Arrays.asList(card("a")), 42);
        oldSkip.batchTeaching = false; oldSkip.phase = StudySession.Phase.QUESTION; oldSkip.skip(); oldSkip.next();
        oldSkip.answer(choice(oldSkip, true)); oldSkip.next(); assert oldSkip.phase == StudySession.Phase.RESULT && oldSkip.correct == 0;
        StudySession listening = new StudySession("listen", "", Arrays.asList(card("a"), card("b")), 42);
        listening.practice(); listening.practice(); List<String> order = listening.options();
        StudySession restored = new StudySession("listen", "", Arrays.asList(card("a"), card("b")), 42);
        restored.practice(); restored.practice(); assert order.equals(restored.options());
        listening.help(); listening.answer(choice(listening, true)); assert listening.correct == 0 && listening.assistedCorrect == 1;
        boolean rejected = false; try { new StudySession("learn", "", Arrays.asList(), 1); } catch (IllegalArgumentException e) { rejected = true; }
        assert rejected;
        System.out.println("PASS: teach whole set, delayed recall, taught distractors, assisted scoring, finite retries, legacy snapshots, stable choices.");
    }
}
