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

public class SocketService {

	private SocketService(){

	}

	private static SocketService INSTANCE = new SocketService();

	public static SocketService getInstance(){
		return INSTANCE;
	}

	private static String TAG = "CordovaService";
	
	private static String SOCKET_URL = "http://192.168.0.14:3000/";
	private static String NSP = "motion-detect-client";

	private String token = null;

	private List<Socket> sockets = new ArrayList<Socket>();

	private NotificationService notificationService;

	public void setContext(NotificationService notificationService){
		this.notificationService = notificationService;
	}

	static String urlEncodeUTF8(String s) {
		try {
			return URLEncoder.encode(s, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			throw new UnsupportedOperationException(e);
		}
	}

	static String urlEncodeUTF8(Map<?, ?> map) {
		StringBuilder sb = new StringBuilder();
		for (Map.Entry<?, ?> entry : map.entrySet()) {
			if (sb.length() > 0) {
				sb.append("&");
			}
			sb.append(String.format("%s=%s", urlEncodeUTF8(entry.getKey()
					.toString()), urlEncodeUTF8(entry.getValue().toString())));
		}
		return sb.toString();
	}

	private Socket initSocket(String cameraId) {

		try {

			String encodedHeaders = urlEncodeUTF8(getCameraHeaders(cameraId));
			IO.Options opts = new IO.Options();
			opts.forceNew = true;
			opts.query = encodedHeaders;
			Socket socket = IO.socket(SOCKET_URL + NSP, opts);
		
			Log.d(TAG, "--- Socket init ---");

			return socket;

		} catch (URISyntaxException e) {
			Log.e(TAG, "Socket init error!");
			Log.e(TAG, e.getMessage());
			e.printStackTrace();
		}
		return null;
	}

	private Map<String, String> getCameraHeaders(String camID) {
		Map<String, String> headers = new HashMap<String, String>();
		headers.put("id", camID);
		headers.put("phone", "true");
		headers.put("token", token);

		return headers;
	}

	private void initEvents(Socket socket) {

		// socket.io().on(Manager.EVENT_TRANSPORT, new Emitter.Listener() {
		// @Override
		// public void call(Object... args) {
		// Transport transport = (Transport) args[0];
		// transport.on(Transport.EVENT_REQUEST_HEADERS,
		// new Emitter.Listener() {
		// @Override
		// public void call(Object... args) {
		// Log.d(TAG, "connect");
		// Map<String, String> headers = (Map<String, String>) args[0];
		// headers.put("id", "cam1");
		// headers.put("phone", "true");
		// headers.put(
		// "token",
		// "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJpYXQiOjE0MjkwODM0OTIsImV4cCI6MTQyOTM4MzQ5Mn0.vjWKxZwue2E48_xGNS4OfJxkCyEsSAKGb9mxTZeYUPM");
		// }
		// });
		// }
		// });

		socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
			@Override
			public void call(Object... args) {
				Log.i(TAG, "connect");
			}
		});

		socket.on("notification:add:mobile", new Emitter.Listener() {

			@Override
			public void call(Object... args) {

				try {
					JSONArray message = new JSONArray(convertMessageArgs(args));

					for (int i = 0; i < message.length(); i++) {
						Log.i(TAG, message.getString(i));
					}

					/*setNotification((String) message.get(0));*/

					notificationService.setNotification((String) message.get(0));

				} catch (JSONException e) {
					e.printStackTrace();
				} catch (Exception e) {
					e.printStackTrace();
				}

			}

		});

		socket.on("disconnect", new Emitter.Listener() {

			@Override
			public void call(Object... args) {

				Log.d(TAG, "SocketService disco.");

			}

		});

		socket.connect();
	}

	private List<Object> convertMessageArgs(Object... args) {
		List<Object> ids = new ArrayList<Object>();
		for (int i = 0; i < args.length; i++) {
			ids.add(args[i]);
		}
		return ids;
	}


	private void init(List<String> cameras) {
		Log.d(TAG, "SocketService init.");

		for (String id : cameras) {
			Socket socket = initSocket(id);
			if(socket!=null){
				Log.d(TAG, socket.toString() + " socket add.");
				sockets.add(socket);
				initEvents(socket);
			}			
		}
	}

	
	public void startServiceCommand(Intent intent) {
		
		String cameras = (String) intent.getExtras().get("cameras");
		token = (String) intent.getExtras().get("token");
		SOCKET_URL = (String) intent.getExtras().get("socket_url");
		init(getCamerasFromJSONString(cameras));
		
	}

	public void stopServiceCommand() {

		Log.d(TAG, "SocketService stopService.");
		Log.d(TAG, sockets.toString());
		for (Socket socket : sockets) {
			Log.d(TAG, socket.toString() + " disconnect.");
			socket.disconnect();
		}
		sockets.clear();

	}

	private List<String> getCamerasFromJSONString(String source) {
		List<String> cameras = new ArrayList<String>();
		try {

			JSONArray camerasJSON = new JSONArray(source);
			for (int i = 0; i < camerasJSON.length(); i++) {
				cameras.add(camerasJSON.getString(i));
			}

		} catch (JSONException e) {
			Log.e(TAG, e.getMessage());
			e.printStackTrace();
		}
		return cameras;
	}

}
