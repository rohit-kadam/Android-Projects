package com.mpdemo.service;

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.widget.Toast;

import com.mpdemo.model.UserTracking;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Created by rohit on 15/1/16.
 */
public class TimeService extends Service {
    // Get Class Name
    private static String TAG = TimeService.class.getName();

    // run on another Thread to avoid crash
    private Handler mHandler = new Handler();
    // timer handling
    private Timer mTimer = null;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        // cancel if already existed
        if (mTimer != null) {
            mTimer.cancel();
        } else {
            // recreate new
            mTimer = new Timer();
        }
        // schedule task
        mTimer.scheduleAtFixedRate(new TimeDisplayTimerTask(), 0, AppContants.mTimeServiceNotifyInterval);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mTimer != null) {
            mTimer.cancel();
        }
    }

    class TimeDisplayTimerTask extends TimerTask {

        @Override
        public void run() {
            // run on another thread
            mHandler.post(new Runnable() {

                @Override
                public void run() {
                    //get and broadcast current hour
                    broadcastCurrentHour();

                    try {
                        //get and broadcast user lat and long
                        broadcastLatLong(new GPSTrackerService(getApplicationContext()));
                    }
                    catch (Exception e) {
//                        Log.d(TAG, e.getMessage());
                    }
                }

            });
        }
    }

    private void broadcastLatLong(GPSTrackerService gpsTracker) {
        if (CommonMethods.getHours() <= AppContants.mAfter_19  && //){
                !CommonMethods.isTodaySunday()) {
            double latitude = gpsTracker.getLatitude();
            double longitude = gpsTracker.getLongitude();
            String userEmail = CommonMethods.getSharedPreferences(getApplicationContext(), AppContants.mPrefNameUserEmail);
            if (latitude != 0.0 && longitude != 0.0 && !userEmail.equals("")) {

                Log.d(TAG, "latitude "+latitude);
                Log.d(TAG, "longitude "+longitude);

                String strLatitude = "" + gpsTracker.getLatitude();
                String strLongitude = "" + gpsTracker.getLongitude();

                //save user latitude and longitude in background
                UserTracking.saveUserTracking(userEmail, strLatitude, strLongitude);

                Intent broadcastIntent = new Intent();
                broadcastIntent.setAction(AppContants.mBroadcastStringLatLongAction);
                broadcastIntent.putExtra("strLat", strLatitude);
                broadcastIntent.putExtra("strLong", strLongitude);
                LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(broadcastIntent);
            }
        }
    }

    private void broadcastCurrentHour() {
        Intent broadcastIntent = new Intent();
        broadcastIntent.setAction(AppContants.mBroadcastStringLogoutAction);
        broadcastIntent.putExtra("current_hour", CommonMethods.getHours());
        LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(broadcastIntent);
    }
}
