/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package hu.elte.web.hajnaldavid.sentinel;

import org.apache.cordova.CordovaActivity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;

public class MainActivity extends CordovaActivity {
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		super.init();
		log("-- START --", 10);		
		IntentFilter filter = new IntentFilter(
				"hu.elte.hajnaldavid.sentinel.command");
		registerReceiver(cameraLoadedBroadcastReceiver, filter);
		// setNotificationService();
		// Set by <content src="index.html" /> in config.xml
		loadUrl(launchUrl);

	}

	private BroadcastReceiver cameraLoadedBroadcastReceiver = new BroadcastReceiver() {

		@Override
		public void onReceive(Context context, Intent intent) {
			log("-- BROADCAST RECEIVED --", 5);		
			// TODO atadni a messageket
			setNotificationService(intent);
		}

	};

	public void onResume() {
		super.onResume();
		log("-- onResume --", 5);	
		IntentFilter filter = new IntentFilter(
				"hu.elte.hajnaldavid.sentinel.command");
		registerReceiver(cameraLoadedBroadcastReceiver, filter);
	}

	public void onPause() {
		super.onPause();
		log("-- onPause --", 5);		
		unregisterReceiver(cameraLoadedBroadcastReceiver);
	}

	private void setNotificationService(Intent intent) {
		log("-- setNotificationService --", 5);	
//		Intent mServiceIntent = new Intent(this, NotificationService.class);
		intent.setClass(this, NotificationService.class);
		this.startService(intent);
	}

	private void log(String msg, int size){
		for (int i = 0; i<size; i++) {
			Log.d(TAG, msg);
		}
	}
}
