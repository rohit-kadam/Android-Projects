package com.demo3.services;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

import com.demo3.authenticator.WordAuthenticator;

/**
 * Created by rohit on 26/02/16.
 */
public class WordAuthenticatorService extends Service {
    // Instance field that stores the authenticator object
    private WordAuthenticator mAuthenticator;

    @Override
    public void onCreate() {
        // Create a new authenticator object
        mAuthenticator = new WordAuthenticator(this);
    }

    /*
     * When the system binds to this Service to make the RPC call
     * return the authenticator's IBinder.
     */
    @Override
    public IBinder onBind(Intent intent) {
        return mAuthenticator.getIBinder();
    }
}