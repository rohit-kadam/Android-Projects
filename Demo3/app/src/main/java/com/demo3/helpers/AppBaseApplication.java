package com.demo3.helpers;

import android.app.Application;

import com.activeandroid.ActiveAndroid;

/**
 * Created by rohit on 26/02/16.
 */
public class AppBaseApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        ActiveAndroid.initialize(this);
    }
}
