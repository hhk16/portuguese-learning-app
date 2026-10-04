import pt.partyportugues.tv.ReviewSchedule;
public final class ReviewScheduleTest {
    public static void main(String[] args) {
        long t = 1700000000000L, day = ReviewSchedule.DAY;
        assert ReviewSchedule.nextStage(0, 0, t, true) == 1;
        assert ReviewSchedule.nextStage(1, t, t + 1000, true) == 1 : "Same-session retry must not advance memory";
        assert ReviewSchedule.nextStage(1, t, t + day, true) == 2;
        assert ReviewSchedule.nextStage(4, t, t + day, false) == 0;
        assert ReviewSchedule.nextStage(5, t, t + day, true) == 5;
        assert ReviewSchedule.nextDue(1, t) == t + day;
        assert ReviewSchedule.nextDue(2, t) == t + 3 * day;
        assert ReviewSchedule.nextDue(3, t) == t + 7 * day;
        assert ReviewSchedule.nextDue(4, t) == t + 14 * day;
        assert ReviewSchedule.nextDue(5, t) == t + 30 * day;
        assert ReviewSchedule.nextDue(0, t) == t;
        System.out.println("Review schedule checks passed");
    }
}
