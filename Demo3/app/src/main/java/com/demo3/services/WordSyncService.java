package com.demo3.services;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

import com.demo3.adapters.WordSyncAdapter;

/**
 * Created by rohit on 26/02/16.
 */
public class WordSyncService extends Service {

    private static final Object sSyncAdapterLock = new Object();
    private static WordSyncAdapter sSyncAdapter = null;

    @Override
    public void onCreate() {
        synchronized (sSyncAdapterLock) {
            if (sSyncAdapter == null)
                sSyncAdapter = new WordSyncAdapter(getApplicationContext(), true);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return sSyncAdapter.getSyncAdapterBinder();
    }
}
