package pt.partyportugues.tv;

/** Deliberate recall on later days, not repeated clicks, increases the interval. */
public final class ReviewSchedule {
    public static final long DAY = 24L * 60 * 60 * 1000;
    public static int nextStage(int previous, long lastSuccess, long now, boolean correct) {
        if (!correct) return 0;
        if (previous > 0 && now - lastSuccess < DAY) return previous;
        return Math.min(5, previous + 1);
    }
    public static long nextDue(int stage, long now) {
        int[] days = {0, 1, 3, 7, 14, 30};
        return now + days[Math.max(0, Math.min(5, stage))] * DAY;
    }
}
