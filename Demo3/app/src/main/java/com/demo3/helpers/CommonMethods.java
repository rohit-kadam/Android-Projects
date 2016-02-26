package com.demo3.helpers;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

/**
 * Created by rohit on 26/02/16.
 */
public class CommonMethods {
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
}
