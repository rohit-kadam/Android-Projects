package com.mpdemo.activity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Html;
import android.util.Log;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.mpdemo.R;
import com.mpdemo.model.UserLoginHistory;
import com.mpdemo.model.UserTracking;
import com.mpdemo.service.TimeService;
import com.mpdemo.service.TooMuchTimeSpentDetectionService;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;

import java.util.List;

import butterknife.Bind;
import butterknife.ButterKnife;

public class UserTrackingDbActivity extends AppCompatActivity {

    private String userEmail;
    private static String TAG = UserTrackingDbActivity.class.getName();
    private boolean hasUserTrackingFound = false;
    private double lat1,long1, lat2, long2;
    private List<UserTracking> userTrackingList = null;
    private List<UserLoginHistory> userLoggingList = null;

    @Bind(R.id.sampleUserParent)
    LinearLayout sampleUserParent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_tracking_db);
        ButterKnife.bind(this);

        if (getIntent().getExtras() != null) {
            Bundle bundle = getIntent().getExtras();
            userEmail = bundle.getString("userEmail");
            Log.d(TAG, userEmail);

            //show user logging history
            TextView textViewUserDataLoginHistory = new TextView(this);
            textViewUserDataLoginHistory.setText(Html.fromHtml("<h4><b>For " + userEmail
                    + " logging history is as follows:-</b></h4>"));
            sampleUserParent.addView(textViewUserDataLoginHistory);

            displayLoginHistory();
        }
    }

    private void displayLoginHistory() {
        new AsyncTask<Void, Void, Boolean>() {

            @Override
            protected Boolean doInBackground(Void... voids) {
                Log.d(TAG, "userEmail from "+userEmail);
                userLoggingList = UserLoginHistory.getAllUserTrackingByEmail(userEmail);
                return null;
            }

            @Override
            protected void onPostExecute(Boolean aBoolean) {
                super.onPostExecute(aBoolean);
                int userTrackingLength = userLoggingList.size();
                if (userLoggingList != null && userTrackingLength > 0) {
                    for (int i=0; i<userTrackingLength; i++) {
                        UserLoginHistory userTracking = userLoggingList.get(i);

                        TextView textViewUserLat = new TextView(getApplicationContext());
                        textViewUserLat.setText("Latitude " + userTracking.latitude);

                        TextView textViewUserLong = new TextView(getApplicationContext());
                        textViewUserLong.setText("Longitude " + userTracking.longitude);

                        TextView textViewUserDate = new TextView(getApplicationContext());
                        textViewUserDate.setText("Created Date " + userTracking.createdDate);

                        TextView textViewUserDivider = new TextView(getApplicationContext());
                        textViewUserDivider.setText("------------------------------------------------------------------");

                        sampleUserParent.addView(textViewUserLat);
                        sampleUserParent.addView(textViewUserLong);
                        sampleUserParent.addView(textViewUserDate);
                        sampleUserParent.addView(textViewUserDivider);
                    }
                }
                else {
                    TextView textViewUserData = new TextView(getApplicationContext());
                    textViewUserData.setText("User logging history not found");
                    sampleUserParent.addView(textViewUserData);
                }

                //show user logging tracking history
                TextView textViewUserDataTrackingHisotry = new TextView(getApplicationContext());
                textViewUserDataTrackingHisotry.setText(Html.fromHtml("<h4><b>For " + userEmail
                        + " tracking is as follows:-</b></h4>"));
                sampleUserParent.addView(textViewUserDataTrackingHisotry);

                displayTracking();
            }
        }.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    private void displayTracking() {
        new AsyncTask<Void, Void, Boolean>() {

            @Override
            protected Boolean doInBackground(Void... voids) {
                Log.d(TAG, "userEmail from "+userEmail);
                userTrackingList = UserTracking.getAllUserTrackingByEmail(userEmail);
                return null;
            }

            @Override
            protected void onPostExecute(Boolean aBoolean) {
                super.onPostExecute(aBoolean);
                int userTrackingLength = userTrackingList.size();
                if (userTrackingList != null && userTrackingLength > 0) {
                    for (int i=0; i<userTrackingLength; i++) {
                        UserTracking userTracking = userTrackingList.get(i);

                        //store user first and last location
                        if (lat1 == 0 && long1 == 0) {
                            lat1 = Double.parseDouble(userTracking.latitude);
                            long1 = Double.parseDouble(userTracking.longitude);
                        }
                        lat2 = Double.parseDouble(userTracking.latitude);
                        long2 = Double.parseDouble(userTracking.longitude);

                        TextView textViewUserLat = new TextView(getApplicationContext());
                        textViewUserLat.setText("Latitude " + userTracking.latitude);

                        TextView textViewUserLong = new TextView(getApplicationContext());
                        textViewUserLong.setText("Longitude " + userTracking.longitude);

                        TextView textViewUserDate = new TextView(getApplicationContext());
                        textViewUserDate.setText("Created Date " + userTracking.createdDate);

                        TextView textViewUserDivider = new TextView(getApplicationContext());
                        textViewUserDivider.setText("------------------------------------------------------------------");

                        sampleUserParent.addView(textViewUserLat);
                        sampleUserParent.addView(textViewUserLong);
                        sampleUserParent.addView(textViewUserDate);
                        sampleUserParent.addView(textViewUserDivider);
                    }

                    TextView distanceCoveredByUser = new TextView(getApplicationContext());
                    distanceCoveredByUser.setText(Html.fromHtml("<font color=\"red\">Distance covered by user "
                            + CommonMethods.distFrom(lat1, long1, lat2, long2)+" Meters</font>"));
                    sampleUserParent.addView(distanceCoveredByUser);
                }
                else {
                    TextView textViewUserData = new TextView(getApplicationContext());
                    textViewUserData.setText("User tracking history record not found");
                    sampleUserParent.addView(textViewUserData);
                }
            }
        }.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

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

    @Override
    protected void onResume() {
        super.onResume();

        LocalBroadcastManager.getInstance(getApplicationContext())
                .registerReceiver(logoutBroadcastReceiver, new IntentFilter(AppContants.mBroadcastStringLogoutAction));
    }

    @Override
    protected void onPause() {
        super.onPause();

        if (logoutBroadcastReceiver != null) {
            LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(logoutBroadcastReceiver);
        }
    }

    private void clearAll() {
        if (logoutBroadcastReceiver != null) {
            LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(logoutBroadcastReceiver);
        }

        //stop all services
        stopService(new Intent(getApplicationContext(), TimeService.class));
        stopService(new Intent(getApplicationContext(), TooMuchTimeSpentDetectionService.class));

        //clear user email from SharedPreferences
        CommonMethods.setSharedPreferences(getApplicationContext(), AppContants.mPrefNameUserEmail, "");

        //start login activity
        CommonMethods.startLoginActivity(getApplicationContext());
    }
}
