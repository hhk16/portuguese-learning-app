package pt.partyportugues.tv;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.view.View;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Small, fixed offline art library. No render loop, network or unbounded texture cache. */
final class Artwork {
    private final Map<String, Bitmap> images = new HashMap<>();
    Artwork(Context context) {
        String[] scenes = {"home", "cafe", "conversation"};
        for (String name : scenes) load(context, name, 1100);
        for (String who : new String[]{"hadi", "ana"}) {
            load(context, who, 128);
            for (String pose : new String[]{"wave", "cheer", "think", "stand"}) load(context, who + "-" + pose, 420);
        }
        for (String food : new String[]{"coffee", "milk", "bread", "soup", "icecream", "cake", "croissant", "water"})
            load(context, food, 256);
    }
    private void load(Context context, String name, int limit) {
        try {
            BitmapFactory.Options o = new BitmapFactory.Options(); o.inJustDecodeBounds = true;
            try (InputStream in = context.getAssets().open("art/" + name + ".webp")) { BitmapFactory.decodeStream(in, null, o); }
            int sample = 1;
            while (Math.max(o.outWidth, o.outHeight) / sample > limit) sample *= 2;
            o.inJustDecodeBounds = false; o.inSampleSize = sample;
            try (InputStream in = context.getAssets().open("art/" + name + ".webp")) {
                Bitmap bitmap = BitmapFactory.decodeStream(in, null, o);
                if (bitmap != null) images.put(name, bitmap);
            }
        } catch (Exception ignored) { /* Native controls remain usable if artwork is unavailable. */ }
    }
    View scene(Context context, String name) { return new ArtView(context, name, false); }
    View character(Context context, String name) { return new ArtView(context, name, true); }
    View tray(Context context, String label) { return new TrayView(context, label); }
    View symbol(Context context, String kind) { return new SymbolView(context, kind); }

    private final class ArtView extends View {
        private final String name;
        private final boolean contain;
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
        ArtView(Context context, String name, boolean contain) {
            super(context); this.name = name; this.contain = contain;
            setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        }
        @Override protected void onDraw(Canvas c) {
            Bitmap b = images.get(name); if (b == null) return;
            float w = getWidth(), h = getHeight();
            float scale = contain ? Math.min(w / b.getWidth(), h / b.getHeight()) : Math.max(w / b.getWidth(), h / b.getHeight());
            float bw = b.getWidth() * scale, bh = b.getHeight() * scale;
            Path clip = new Path(); clip.addRoundRect(new RectF(0, 0, w, h), 20, 20, Path.Direction.CW);
            c.save(); c.clipPath(clip);
            float top = name.equals("home") ? 0 : (h - bh) / 2;
            c.drawBitmap(b, null, new RectF((w - bw) / 2, top, (w + bw) / 2, top + bh), paint); c.restore();
        }
    }
    private static String food(String label) {
        if (label.contains("coffee")) return "coffee";
        if (label.contains("milk")) return "milk";
        if (label.contains("bread")) return "bread";
        if (label.contains("soup")) return "soup";
        if (label.contains("ice cream")) return "icecream";
        if (label.contains("croissant")) return "croissant";
        if (label.contains("cake")) return "cake";
        return "water";
    }
    private final class TrayView extends View {
        private final List<String> items = new ArrayList<>();
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
        TrayView(Context context, String label) {
            super(context); setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
            for (String part : label.toLowerCase(java.util.Locale.ROOT).split("\\+")) {
                String value = part.trim();
                int count = Character.isDigit(value.charAt(0)) ? Character.digit(value.charAt(0), 10) : 1;
                for (int i = 0; i < Math.min(3, count); i++) items.add(food(value));
            }
        }
        @Override protected void onDraw(Canvas c) {
            float w = getWidth(), h = getHeight();
            paint.setColor(Color.rgb(228, 201, 164));
            c.drawRoundRect(new RectF(w * .06f, h * .27f, w * .94f, h * .92f), h * .12f, h * .12f, paint);
            paint.setColor(Color.rgb(244, 221, 187));
            c.drawRoundRect(new RectF(w * .085f, h * .3f, w * .915f, h * .86f), h * .09f, h * .09f, paint);
            float slot = w * .82f / Math.max(1, items.size());
            float side = Math.min(slot * 1.2f, h * .95f);
            for (int i = 0; i < items.size(); i++) {
                Bitmap b = images.get(items.get(i)); if (b == null) continue;
                float center = w * .09f + slot * (i + .5f);
                float scale = side / Math.max(b.getWidth(), b.getHeight());
                float bw = b.getWidth() * scale, bh = b.getHeight() * scale;
                c.drawBitmap(b, null, new RectF(center - bw / 2, h * .53f - bh / 2, center + bw / 2, h * .53f + bh / 2), paint);
            }
        }
    }
    private static final class SymbolView extends View {
        private final String kind;
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        SymbolView(Context context, String kind) { super(context); this.kind = kind; setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO); }
        private void fill(Canvas c, int colour, float l, float t, float r, float b, float radius) {
            p.setStyle(Paint.Style.FILL); p.setColor(colour); c.drawRoundRect(new RectF(l, t, r, b), radius, radius, p);
        }
        @Override protected void onDraw(Canvas canvas) {
            canvas.save(); canvas.scale(getWidth() / 160f, getHeight() / 120f);
            int blue = Color.rgb(26, 105, 242), navy = Color.rgb(21, 38, 92);
            if (kind.equals("listen")) {
                p.setColor(blue); p.setStrokeWidth(12); p.setStyle(Paint.Style.STROKE);
                canvas.drawArc(new RectF(38, 17, 122, 108), 180, 180, false, p);
                fill(canvas, navy, 27, 60, 51, 102, 10); fill(canvas, navy, 109, 60, 133, 102, 10);
                p.setColor(blue); p.setStrokeWidth(5); p.setStrokeCap(Paint.Cap.ROUND);
                for (int i = 0; i < 7; i++) { float height = new float[]{12, 27, 17, 37, 23, 12, 18}[i]; canvas.drawLine(59 + i * 7, 66 - height / 2, 59 + i * 7, 66 + height / 2, p); }
            } else if (kind.equals("grammar")) {
                fill(canvas, Color.rgb(146, 208, 180), 26, 24, 128, 98, 13);
                fill(canvas, Color.WHITE, 36, 14, 138, 88, 13);
                p.setColor(navy); p.setTypeface(android.graphics.Typeface.DEFAULT_BOLD); p.setTextSize(34); p.setStyle(Paint.Style.FILL);
                canvas.drawText("A", 49, 59, p); fill(canvas, blue, 82, 36, 124, 43, 3); fill(canvas, blue, 82, 52, 113, 59, 3);
                fill(canvas, Color.rgb(247, 186, 71), 47, 98, 123, 104, 3);
            } else if (kind.equals("review")) {
                fill(canvas, Color.rgb(224, 235, 248), 34, 16, 126, 108, 12);
                fill(canvas, Color.WHITE, 26, 10, 116, 102, 12);
                p.setColor(Color.rgb(44, 159, 105)); p.setStrokeWidth(9); p.setStrokeCap(Paint.Cap.ROUND);
                canvas.drawLine(46, 56, 62, 72, p); canvas.drawLine(62, 72, 96, 37, p);
            } else {
                fill(canvas, Color.rgb(245, 191, 79), 22, 27, 79, 103, 9);
                fill(canvas, Color.rgb(255, 226, 161), 81, 27, 138, 103, 9);
                p.setColor(navy); p.setStrokeWidth(4); p.setStrokeCap(Paint.Cap.ROUND);
                for (int i = 0; i < 3; i++) { canvas.drawLine(36, 47 + i * 16, 65, 47 + i * 16, p); canvas.drawLine(95, 47 + i * 16, 124, 47 + i * 16, p); }
            }
            canvas.restore();
        }
    }
}
