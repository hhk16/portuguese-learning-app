import pt.partyportugues.tv.CafeOrder;
import pt.partyportugues.tv.StudySession;
import java.util.Arrays;

/** Check real order quantities, finite independent retries, assistance and safe restoration. */
public class CafeOrderTest {
    private static StudySession.Card order(String id, String answer) {
        return new StudySession.Card(id, "cafe", "Queria…", answer, "Listen", answer, "", "clip.mp3", Arrays.asList(answer, "1 coffee", "1 milk"));
    }
    public static void main(String[] args) {
        CafeOrder tray = new CafeOrder();
        assert !tray.change(0, -1);
        assert tray.change(0, 1) && tray.change(1, 1);
        assert tray.matches("1 milk + 1 coffee") : "Order of additions must not affect scoring";
        assert !tray.matches("2 coffees") : "Food matters, not just total quantity";
        assert !tray.matches("2 coffees + 1 milk") : "Quantities matter";
        assert CafeOrder.restore(tray.snapshot()).matches("1 coffee + 1 milk");
        tray.clear();
        for (int i = 0; i < 3; i++) assert tray.change(7, 1);
        assert !tray.change(7, 1);
        assert tray.change(0, 1) && tray.change(0, 1) && !tray.change(0, 1);
        assert tray.matches("3 waters + 2 coffees");
        assert !tray.change(-1, 1) && !tray.change(99, 1) && !tray.change(0, 2);
        for (String invalid : new String[]{"", "1 tea", "0 coffees", "4 coffees", "3 coffees + 3 milks", "1 coffee + 1 coffee"}) {
            boolean rejected = false;
            try { CafeOrder.parse(invalid); } catch (IllegalArgumentException e) { rejected = true; }
            assert rejected : invalid;
        }
        StudySession s = new StudySession("cafe", "", Arrays.asList(order("guided", "1 coffee"), order("solo", "1 milk"), order("help", "2 coffees")), 15);
        assert s.phase == StudySession.Phase.TEACH && !s.submitTray();
        s.practice(); assert !s.submitTray() : "An empty tray cannot be served";
        s.tray.change(0, 1); assert s.submitTray() && s.wasCorrect();
        assert !s.submitTray() && s.correct == 0 : "Guided and duplicate submissions cannot earn independent points";
        s.next(); assert s.tray.total() == 0 && !s.guidedOrder();
        s.tray.change(1, 1); s.submitTray(); assert s.correct == 1;
        s.next(); s.assisted = true; s.tray.change(0, 1); s.tray.change(0, 1); s.submitTray();
        assert s.wasCorrect() && s.correct == 1 && s.assistedCorrect == 1;
        s.next(); assert s.card().id.equals("help") && !s.assisted : "Help must lead to an independent retry";
        s.tray.change(1, 1); s.submitTray(); s.next();
        assert s.phase == StudySession.Phase.RESULT && s.correct == 1 && s.independentCount() == 2;
        StudySession restart = s.restart();
        assert restart.tray.total() == 0 && restart.assistedCorrect == 0 && restart.phase == StudySession.Phase.TEACH;
        System.out.println("PASS: café item/quantity matching, bounds, empty/duplicate serving, guided/help scoring and finite retries.");
    }
}
