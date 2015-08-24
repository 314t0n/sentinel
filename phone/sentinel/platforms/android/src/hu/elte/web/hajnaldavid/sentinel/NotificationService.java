package hu.elte.web.hajnaldavid.sentinel;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;

import android.app.IntentService;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.github.nkzawa.emitter.Emitter;
import com.github.nkzawa.socketio.client.IO;
import com.github.nkzawa.socketio.client.Socket;

public class NotificationService extends IntentService {

	private static String TAG = "CordovaService";

	private static SocketService socketService = SocketService.getInstance();

	public NotificationService() {
		super("NotificationService");	
		socketService.setContext(this);
	}

	public NotificationService(String name) {
		super(name);		
	}

	@Override
	protected void onHandleIntent(Intent intent) {

		Log.d(TAG, "NotificationService onHandleIntent.");

		String command = (String) intent.getExtras().get("command");

		Log.d(TAG, "Command: " + command);

		if (command.equals("1")) {
			
			socketService.startServiceCommand(intent);
			
		} else if(command.equals("0")) {
			
			socketService.stopServiceCommand();
			
		}	

	}

	public void setNotification(String msg) {
		Intent notificationIntent = new Intent(this, MainActivity.class);
		showNotification(notificationIntent, msg);
	}

	private void showNotification(Intent notificationIntent) {
		showNotification(notificationIntent, "");
	}

	private void showNotification(Intent notificationIntent, String msg) {

		// PendingIntent pendingIntent = PendingIntent.getActivity(this, 0,
		// intent, 0);
		//
		// notificationIntent = new Intent(this, MainActivity.class);
		notificationIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP
				| Intent.FLAG_ACTIVITY_SINGLE_TOP);

		PendingIntent pendingIntent = PendingIntent.getActivity(this, 0,
				notificationIntent, 0);

		NotificationCompat.Builder builder = new NotificationCompat.Builder(
				this).setContentTitle("IntentServiceRefresh")
				.setContentTitle("Sentinel").setContentText(msg)
				.setSmallIcon(R.drawable.eye_icon)
				.setContentIntent(pendingIntent);
		Notification notification = builder.build();

		notification.ledARGB = 0xFFff0000;
		notification.flags = Notification.FLAG_SHOW_LIGHTS;
		notification.ledOnMS = 100;
		notification.ledOffMS = 100;

		// Hide the notification after it's selected
		notification.flags |= Notification.FLAG_AUTO_CANCEL;

		NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

		notificationManager.notify(0, notification);

	}

}
