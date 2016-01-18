package com.mpdemo.activity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.mpdemo.R;
import com.mpdemo.model.UserLoginHistory;
import com.mpdemo.service.TimeService;
import com.mpdemo.service.TooMuchTimeSpentDetectionService;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;
import com.nispok.snackbar.Snackbar;

import butterknife.Bind;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class DashboardActivity extends AppCompatActivity {

    @Bind(R.id.txtDashboardWelcome)
    TextView txtDashboardWelcome;

    @Bind(R.id.txtLatLong)
    TextView txtLatLong;

    @Bind(R.id.btnLoadSampleData)
    Button btnLoadSampleData;

    @Bind(R.id.btnAllUserDb)
    Button btnAllUserDb;

    /**
     * receiver to auto logout after 7 PM or today is Sunday
     */
    private BroadcastReceiver logoutBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getExtras() != null) {
                Bundle bundle = intent.getExtras();
                if (bundle.getInt("current_hour") >= AppContants.mAfter_19 ||
                        CommonMethods.isTodaySunday()) {

                        Toast.makeText(context, getString(R.string.error_login_9_to_7), Toast.LENGTH_LONG).show();

                        clearAll();
                }
            }
        }
    };

    /**
     * receiver to get current lat and long of user
     */
    private BroadcastReceiver latLongBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.d(TAG, "get latLongBroadcastReceiver");
            if (intent.getExtras() != null) {
                Bundle bundle = intent.getExtras();
                final String strLat = bundle.getString("strLat");
                final String strLong = bundle.getString("strLong");
                Log.d(TAG, "strLat "+strLat+" strLong "+strLong);
                txtLatLong.post(new Runnable() {
                    @Override
                    public void run() {
                        txtLatLong.setText("Your Latitude "+strLat+" and Longitude "+strLong);
                    }
                });
            }
        }
    };

    private String userEmail = "";
    // Get Class Name
    private static String TAG = DashboardActivity.class.getName();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);
        ButterKnife.bind(this);

        if (!CommonMethods.getSharedPreferences(getApplicationContext(), AppContants.mPrefNameUserEmail).equals("")) {
            userEmail = CommonMethods.getSharedPreferences(getApplicationContext(), AppContants.mPrefNameUserEmail);
            Snackbar.with(getApplicationContext()).text(userEmail).show(this);
            init();
        }
    }

    @OnClick(R.id.btnLoadSampleData)
    public void doLoadSampleData(Button button) {
        Intent intent = new Intent(this, SampleUserShowActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    @OnClick(R.id.btnAllUserDb)
    public void doLoadUserDataDb(Button button) {
        Intent intent = new Intent(this, UserShowFromDbActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    @OnClick(R.id.btnLogout)
    public void doLogout(Button button) {
        clearAll();

        finish();
    }

    private void clearAll() {
        if (logoutBroadcastReceiver != null) {
            LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(logoutBroadcastReceiver);
        }

        if (latLongBroadcastReceiver != null) {
            LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(latLongBroadcastReceiver);
        }

        //stop all services
        stopService(new Intent(getApplicationContext(), TimeService.class));
        stopService(new Intent(getApplicationContext(), TooMuchTimeSpentDetectionService.class));

        //clear user email from SharedPreferences
        CommonMethods.setSharedPreferences(getApplicationContext(), AppContants.mPrefNameUserEmail, "");

        //start login activity
        CommonMethods.startLoginActivity(getApplicationContext());
    }

    /**
     * all init after successful login
     */
    private void init() {
        Log.d(TAG, "get init");
        txtDashboardWelcome.setText(getString(R.string.welcome_message_sign_in) + " (" + userEmail + ")");

        //start require services
        startService(new Intent(this, TimeService.class));
        startService(new Intent(this, TooMuchTimeSpentDetectionService.class));

        if(!userEmail.equals("admin@gmail.com")) {
            btnLoadSampleData.setVisibility(View.GONE);
            btnAllUserDb.setVisibility(View.GONE);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "get onResume");

        LocalBroadcastManager.getInstance(getApplicationContext())
                .registerReceiver(logoutBroadcastReceiver, new IntentFilter(AppContants.mBroadcastStringLogoutAction));

        LocalBroadcastManager.getInstance(getApplicationContext())
                .registerReceiver(latLongBroadcastReceiver, new IntentFilter(AppContants.mBroadcastStringLatLongAction));
    }

    @Override
    protected void onPause() {
        super.onPause();

        Log.d(TAG, "get onPause");

        if (logoutBroadcastReceiver != null) {
            LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(logoutBroadcastReceiver);
        }

        if (latLongBroadcastReceiver != null) {
            LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(latLongBroadcastReceiver);
        }
    }
}
