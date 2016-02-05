package com.demo2.base;

import android.app.Application;

import com.android.volley.RequestQueue;
import com.android.volley.toolbox.Volley;

/**
 * Created by rohit on 05/02/16.
 */
public class BaseApplication extends Application {
    private static BaseApplication sInstance;

    private RequestQueue mRequestQueue;

    @Override
    public void onCreate() {
        super.onCreate();

        mRequestQueue = Volley.newRequestQueue(this);

        sInstance = this;
    }

    public synchronized static BaseApplication getInstance() {
        return sInstance;
    }

    public RequestQueue getRequestQueue() {
        return mRequestQueue;
    }
}
