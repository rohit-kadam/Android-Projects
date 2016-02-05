package com.demo2.utils;

import android.app.Activity;
import android.content.SharedPreferences;

/**
 * Created by rohit on 04/02/16.
 */
public class PreferenceManager {

    public static boolean putStringInPreferences(Activity activity,String value, String key){
        SharedPreferences sharedPreferences = activity.getPreferences(Activity.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(key, value);
        editor.commit();
        return true;
    }

    public static String getStringFromPreferences(Activity activity,String defaultValue, String key){
        SharedPreferences sharedPreferences = activity.getPreferences(Activity.MODE_PRIVATE);
        String temp = sharedPreferences.getString(key, defaultValue);
        return temp;
    }
}
