package com.mpdemo.activity;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import com.activeandroid.ActiveAndroid;
import com.mpdemo.R;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;

public class SplashScreenActivity extends AppCompatActivity {

    Context context;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash_screen);
        ActiveAndroid.initialize(this);

        context = this;

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent = null;
                if (CommonMethods.getSharedPreferences(getApplicationContext(), AppContants.mPrefNameUserEmail).equals("")) {
                    intent = new Intent(context, LoginActivity.class);
                }
                else {
                    intent = new Intent(context, DashboardActivity.class);
                }
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                finish();
            }

        }, 2000);
    }
}
