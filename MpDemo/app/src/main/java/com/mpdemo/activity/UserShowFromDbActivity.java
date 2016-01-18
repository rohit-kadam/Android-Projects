package com.mpdemo.activity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.mpdemo.R;
import com.mpdemo.model.User;
import com.mpdemo.service.TimeService;
import com.mpdemo.service.TooMuchTimeSpentDetectionService;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;

import java.util.List;

import butterknife.Bind;
import butterknife.ButterKnife;

public class UserShowFromDbActivity extends AppCompatActivity {

    private List<User> users = null;
    private static String TAG = UserShowFromDbActivity.class.getName();

    @Bind(R.id.sampleUserParent)
    LinearLayout sampleUserParent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_show_from_db);
        ButterKnife.bind(this);

        new AsyncTask<Void, Void, Boolean>() {

            @Override
            protected Boolean doInBackground(Void... voids) {
                users = User.getAllUser();
                return null;
            }

            @Override
            protected void onPostExecute(Boolean aBoolean) {
                super.onPostExecute(aBoolean);
                int usersLength = users.size();
                if (users != null && usersLength > 0) {
                    for (int i=0; i<usersLength; i++) {
                        User user = users.get(i);
                        TextView textViewUserData = new TextView(getApplicationContext());
                        textViewUserData.setText(user.email);
                        textViewUserData.setTag(user);
                        textViewUserData.setOnClickListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                try {
                                    User selectedUser = (User) v.getTag();
                                    Intent intent = new Intent(getApplicationContext(), UserTrackingDbActivity.class);
                                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    intent.putExtra("userEmail", selectedUser.email);
                                    startActivity(intent);
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        });

                        TextView textViewUserDivider = new TextView(getApplicationContext());
                        textViewUserDivider.setText("------------------------------------------------------------------");

                        sampleUserParent.addView(textViewUserData);
                        sampleUserParent.addView(textViewUserDivider);
                    }
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
