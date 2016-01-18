package com.mpdemo.service;

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;

import com.activeandroid.ActiveAndroid;
import com.mpdemo.model.UserSpentTooTime;
import com.mpdemo.model.UserTracking;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;

import java.util.Timer;
import java.util.TimerTask;

/**
 * Created by rohit on 15/1/16.
 */
public class TooMuchTimeSpentDetectionService extends Service {
    // Get Class Name
    private static String TAG = TooMuchTimeSpentDetectionService.class.getName();

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
        mTimer.scheduleAtFixedRate(new TimeDisplayTimerTask(), 0, AppContants.mTooMuchTimeSpentNotifyInterval);
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
                    try {
                        String userEmail = CommonMethods.getSharedPreferences(getApplicationContext(), AppContants.mPrefNameUserEmail);
                        if (!userEmail.equals("")) {
                            //get last user tracking value
                            UserTracking userTracking = UserTracking.getLastUserTrackingEntry(userEmail);
                            if (userTracking != null) {
                                //latest user lat and long
                                GPSTrackerService gpsTracker = new GPSTrackerService(getApplicationContext());
                                double latitude = gpsTracker.getLatitude();
                                double longitude = gpsTracker.getLongitude();

                                //last known lat and long
                                double latitude2 = Double.parseDouble(userTracking.latitude);
                                double longitude2 = Double.parseDouble(userTracking.longitude);

                                if (latitude != 0.0 && longitude != 0.0) {
                                    //check whether user spent too much time within same location
                                    if (CommonMethods.hasUserSpentTooMuchTime(latitude, longitude, latitude2, longitude2)) {
                                        //save that too much time spent location
                                        UserSpentTooTime userSpentTooTime = new UserSpentTooTime();
                                        userSpentTooTime.email = userEmail;
                                        userSpentTooTime.latitude = "" + latitude;
                                        userSpentTooTime.longitude = "" + longitude;
                                        userSpentTooTime.createdDate = CommonMethods.getCurrentDateTime();
                                        userSpentTooTime.save();
                                    }
                                }
                            }
                        }
                    }
                    catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        }
    }
}
