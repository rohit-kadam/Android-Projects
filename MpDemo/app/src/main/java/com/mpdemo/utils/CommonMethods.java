package com.mpdemo.utils;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Location;
import android.preference.PreferenceManager;
import android.util.Log;

import com.mpdemo.activity.DashboardActivity;
import com.mpdemo.activity.LoginActivity;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/**
 * Created by rohit on 15/1/16.
 */
public class CommonMethods {
    /**
     * get hours 00 to 23
     * @return
     */
    public static int getHours() {
        Calendar calendar = Calendar.getInstance();
        int hours = calendar.get(Calendar.HOUR_OF_DAY);
        return hours;
    }

    public static String getCurrentDateTime() {
        // get date time in custom format
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
        return sdf.format(new Date());
    }

    public static boolean isTodaySunday() {
        Calendar calendar = Calendar.getInstance();
        if (calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
            return true;
        }

        return false;
    }

    /**
     *
     * @param lat1
     * @param lon1
     * @param lat2
     * @param lon2
     * @return
     */
    public static boolean hasUserSpentTooMuchTime(double lat1, double lon1, double lat2, double lon2) {

        double distanceInMeters = CommonMethods.distFrom(lat1, lon1, lat2, lon2);

        if(distanceInMeters < AppContants.minimumDistanceAllowInMeters)
            return true;

        return false;
    }

    public static void startLoginActivity(Context context) {
        Intent intent = new Intent(context, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    public static void setSharedPreferences(Context context, String prefName, String value) {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(context);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(prefName, value);
        editor.commit();
    }

    public static String getSharedPreferences(Context context, String prefName) {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(context);
        return prefs.getString(prefName, "");
    }

    public static String getSampleUserJson(Context contex) {
        return getRawString(contex, "sample_user");
    }

    public static String getSampleUserTrackingJson(Context contex) {
        return getRawString(contex, "sample_user_tracking");
    }

    public static String getRawString(Context context, String resourceName) {
        try {
            InputStream inputStream = context.getResources().openRawResource(context.getResources()
                    .getIdentifier(resourceName, "raw", context.getPackageName()));
            int size = inputStream.available();
            byte[] buffer = new byte[size];
            inputStream.read(buffer);
            inputStream.close();
            String rawString = new String(buffer);
            return rawString;
        } catch (IOException ex) {
        }
        return null;
    }

    public static double distFrom(double lat1, double lng1, double lat2, double lng2) {
        Location locationA = new Location("");
        locationA.setLatitude(lat1);
        locationA.setLongitude(lng1);

        Location locationB = new Location("");
        locationB.setLatitude(lat2);
        locationB.setLongitude(lng2);

        return locationA.distanceTo(locationB) ;
    }
}
