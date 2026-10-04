package pt.partyportugues.tv;

import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.PlaybackParams;
import android.os.Handler;
import android.os.Looper;
import java.io.IOException;

/** One local clip at a time. No network, TTS setup screens, or overlapping host/music tracks. */
final class Speech {
    private final Context context;
    private final AudioManager audio;
    private final Handler main = new Handler(Looper.getMainLooper());
    private MediaPlayer player;
    private final AudioManager.OnAudioFocusChangeListener focus = change -> {
        if (change <= AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) main.post(this::stop);
    };
    Speech(Context context) {
        this.context = context;
        audio = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
    }
    boolean play(String file, boolean slow, Runnable unavailable) {
        stop();
        if (file.isEmpty()) { unavailable.run(); return false; }
        if (audio.requestAudioFocus(focus, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) { unavailable.run(); return false; }
        MediaPlayer next = new MediaPlayer(); player = next;
        next.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
        next.setOnPreparedListener(p -> {
            if (player != p) return;
            if (slow) p.setPlaybackParams(new PlaybackParams().setSpeed(0.8f).setPitch(1f));
            p.start();
        });
        next.setOnCompletionListener(p -> { if (player == p) stop(); });
        next.setOnErrorListener((p, what, extra) -> {
            if (player == p) { stop(); unavailable.run(); } return true;
        });
        try (AssetFileDescriptor fd = context.getAssets().openFd("audio/" + file)) {
            next.setDataSource(fd.getFileDescriptor(), fd.getStartOffset(), fd.getLength());
            next.prepareAsync(); return true;
        } catch (IOException | RuntimeException e) {
            stop(); unavailable.run(); return false;
        }
    }
    void stop() {
        MediaPlayer old = player; player = null;
        if (old != null) old.release();
        audio.abandonAudioFocus(focus);
    }
}
