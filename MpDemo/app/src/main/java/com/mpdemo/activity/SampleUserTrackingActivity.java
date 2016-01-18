package com.mpdemo.activity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Html;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.mpdemo.R;
import com.mpdemo.service.TimeService;
import com.mpdemo.service.TooMuchTimeSpentDetectionService;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import butterknife.Bind;
import butterknife.ButterKnife;

public class SampleUserTrackingActivity extends AppCompatActivity {

    private String userEmail;
    private static String TAG = SampleUserTrackingActivity.class.getName();
    private boolean hasUserTrackingFound = false;
    private double lat1,long1, lat2, long2;

    @Bind(R.id.sampleUserParent)
    LinearLayout sampleUserParent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sample_user_tracking);
        ButterKnife.bind(this);

        if (getIntent().getExtras() != null) {
            Bundle bundle = getIntent().getExtras();
            userEmail = bundle.getString("userEmail");
            Log.d(TAG, userEmail);

            TextView textViewUserData = new TextView(this);
            textViewUserData.setText(Html.fromHtml("<h4><b>For " + userEmail + " tracking is as follows:-</b></h4>"));
            sampleUserParent.addView(textViewUserData);

            displayTracking();
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        finish();
    }

    private void displayTracking() {
        try {
            String rawSampleUsers = CommonMethods.getSampleUserTrackingJson(this);
            JSONArray jsonArrayRawSampleUsers = new JSONArray(rawSampleUsers);
            int arrayLength = jsonArrayRawSampleUsers.length();

            if (arrayLength > 0){
                for (int i=0; i < arrayLength; i++) {
                    JSONObject jsonObjectUser = jsonArrayRawSampleUsers.getJSONObject(i);

                    //too much time at a place calculation

                    //store user first and last location
                    /*if (i == 0) {
                        lat1 = Double.parseDouble(jsonObjectUser.getString("latitude"));
                        long1 = Double.parseDouble(jsonObjectUser.getString("longitude"));
                    }
                    else if (i == (arrayLength - 1)) {
                        lat2 = Double.parseDouble(jsonObjectUser.getString("latitude"));
                        long2 = Double.parseDouble(jsonObjectUser.getString("longitude"));
                    }*/

                    //check is data is available or not
                    //and display if available
                    if (jsonObjectUser.get("email").equals(userEmail)) {
                        hasUserTrackingFound = true;

                        if (lat1 == 0 && long1 == 0) {
                            lat1 = Double.parseDouble(jsonObjectUser.getString("latitude"));
                            long1 = Double.parseDouble(jsonObjectUser.getString("longitude"));
                        }

                        lat2 = Double.parseDouble(jsonObjectUser.getString("latitude"));
                        long2 = Double.parseDouble(jsonObjectUser.getString("longitude"));

                        TextView textViewUserLat = new TextView(this);
                        textViewUserLat.setText("Latitude " + jsonObjectUser.get("latitude"));

                        TextView textViewUserLong = new TextView(this);
                        textViewUserLong.setText("Longitude " + jsonObjectUser.get("longitude"));

                        TextView textViewUserDate = new TextView(this);
                        textViewUserDate.setText("Created Date " + jsonObjectUser.get("createdDate"));

                        TextView textViewUserDivider = new TextView(this);
                        textViewUserDivider.setText("------------------------------------------------------------------");

                        sampleUserParent.addView(textViewUserLat);
                        sampleUserParent.addView(textViewUserLong);
                        sampleUserParent.addView(textViewUserDate);
                        sampleUserParent.addView(textViewUserDivider);
                    }
                }

                if (!hasUserTrackingFound) {
                    TextView textViewUserData = new TextView(this);
                    textViewUserData.setText("Record not found");
                    sampleUserParent.addView(textViewUserData);
                }
                else {
                    Log.d(TAG, "lat1, long1, lat2, long2 "+lat1+" "+long1+" "+lat2+" "+long2);
                    TextView distanceCoveredByUser = new TextView(this);
                    distanceCoveredByUser.setText(Html.fromHtml("<font color=\"red\">Distance covered by user "
                            +CommonMethods.distFrom(lat1, long1, lat2, long2)+" Meters</font>"));
                    sampleUserParent.addView(distanceCoveredByUser);
                }
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
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
