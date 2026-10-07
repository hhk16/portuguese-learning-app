package pt.partyportugues.tv;

import java.util.Locale;

/** A bounded, editable tray. Orders are compared by items and quantities, never text order. */
public final class CafeOrder {
    public static final String[] ART = {"coffee", "milk", "bread", "soup", "icecream", "cake", "croissant", "water"};
    public static final String[] PT = {"o café", "o leite", "o pão", "a sopa", "o gelado", "o bolo", "o croissant", "a água"};
    public static final String[] EN = {"coffee", "milk", "bread roll", "soup", "ice cream", "cake", "croissant", "water"};
    private static final String[] PLURAL = {"coffees", "milks", "bread rolls", "soups", "ice creams", "cakes", "croissants", "waters"};
    public static final int MAX_ITEMS = 5, MAX_QUANTITY = 3;
    private final int[] counts = new int[ART.length];

    public int quantity(int item) { return counts[item]; }
    public int total() { int n = 0; for (int value : counts) n += value; return n; }
    public boolean change(int item, int delta) {
        if (item < 0 || item >= counts.length || (delta != 1 && delta != -1)) return false;
        int next = counts[item] + delta;
        if (next < 0 || next > MAX_QUANTITY || total() + delta > MAX_ITEMS) return false;
        counts[item] = next; return true;
    }
    public void clear() { java.util.Arrays.fill(counts, 0); }
    public int[] snapshot() { return counts.clone(); }
    public static CafeOrder restore(int[] saved) {
        if (saved.length != ART.length) throw new IllegalArgumentException("Invalid tray size");
        CafeOrder out = new CafeOrder();
        for (int i = 0; i < saved.length; i++) {
            if (saved[i] < 0 || saved[i] > MAX_QUANTITY) throw new IllegalArgumentException("Invalid quantity");
            out.counts[i] = saved[i];
        }
        if (out.total() > MAX_ITEMS) throw new IllegalArgumentException("Tray is too full");
        return out;
    }
    public static CafeOrder parse(String label) {
        CafeOrder out = new CafeOrder();
        for (String part : label.toLowerCase(Locale.ROOT).split("\\+")) {
            String value = part.trim(); int space = value.indexOf(' ');
            if (space < 1) throw new IllegalArgumentException("Missing quantity");
            int count = Integer.parseInt(value.substring(0, space));
            String name = value.substring(space + 1); int item = -1;
            for (int i = 0; i < EN.length; i++) if (name.equals(EN[i]) || name.equals(PLURAL[i])) item = i;
            if (item < 0 || count < 1 || count > MAX_QUANTITY || out.counts[item] != 0)
                throw new IllegalArgumentException("Invalid order item");
            out.counts[item] = count;
        }
        return restore(out.counts);
    }
    public boolean matches(String label) { return java.util.Arrays.equals(counts, parse(label).counts); }
    public String label() {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < counts.length; i++) if (counts[i] > 0) {
            if (out.length() > 0) out.append(" + ");
            out.append(counts[i]).append(' ').append(counts[i] == 1 ? EN[i] : PLURAL[i]);
        }
        return out.toString();
    }
}
