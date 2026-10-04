import pt.partyportugues.tv.StudySession;
import java.util.Arrays;
import java.util.List;

/** Run without Android or dependencies: javac + java -ea. */
public class StudySessionTest {
    static StudySession.Card card(String id) {
        return new StudySession.Card(id, "phrase", "Olá!", "Hi!", "Olá!", "Hi!", "", "a.mp3", Arrays.asList("Hi!", "Bye!", "Please."));
    }
    static int choice(StudySession s, boolean correct) {
        List<String> opts = s.options();
        int answer = opts.indexOf(s.card().answer);
        return correct ? answer : (answer + 1) % opts.size();
    }
    public static void main(String[] args) {
        StudySession s = new StudySession("learn", "u00.greetings", Arrays.asList(card("a"), card("b")), 12);
        assert s.phase == StudySession.Phase.TEACH;
        assert !s.answer(0) : "A teaching card is not a question";
        s.practice();
        assert !s.answer(-1) && !s.answer(99);
        assert s.answer(choice(s, false));
        assert !s.answer(choice(s, true)) : "Repeated OK must not rescore an answer";
        assert s.correct == 0 && s.index == 0 && s.phase == StudySession.Phase.FEEDBACK;
        s.next(); assert s.index == 1 && s.phase == StudySession.Phase.TEACH;
        s.practice(); s.answer(choice(s, true)); s.next();
        assert s.index == 2 && s.deck.size() == 3 && s.phase == StudySession.Phase.QUESTION;
        assert s.card().id.equals("a") : "Only the missed item returns";
        s.answer(choice(s, false)); s.next();
        assert s.phase == StudySession.Phase.RESULT && s.correct == 1 : "A failed retry must still end the game";
        s.next(); assert s.index == 3 : "Results do not advance themselves";
        s.players = 2;
        StudySession again = s.restart();
        assert again.deck.size() == 2 && again.players == 2 && again.correct == 0;
        assert again.missed.isEmpty() && again.phase == StudySession.Phase.TEACH;
        StudySession skip = new StudySession("listen", "", Arrays.asList(card("a")), 42);
        skip.skip(); assert !skip.wasCorrect() && skip.correct == 0;
        skip.next(); assert skip.deck.size() == 2;
        skip.answer(choice(skip, true)); skip.next();
        assert skip.correct == 0 && skip.phase == StudySession.Phase.RESULT : "Transcript use and retries must not inflate listening score";
        StudySession restored = new StudySession("listen", "", Arrays.asList(card("a")), 42);
        assert restored.options().equals(new StudySession("listen", "", Arrays.asList(card("a")), 42).options()) : "Restored choices must keep their order";
        boolean emptyRejected = false;
        try { new StudySession("learn", "", Arrays.asList(), 1); } catch (IllegalArgumentException e) { emptyRejected = true; }
        assert emptyRejected;
        System.out.println("PASS: finite retries, intentional advance, duplicate input, transcript scoring, restore order, two-player restart.");
    }
}
