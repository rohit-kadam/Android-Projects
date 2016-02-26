package com.demo3.activites;

import android.content.BroadcastReceiver;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import com.demo3.R;
import com.demo3.adapters.WordSyncAdapter;
import com.demo3.adapters.WordsAdapter;
import com.demo3.helpers.AppConstants;
import com.demo3.interfaces.WordRestService;
import com.demo3.models.Word;

import java.util.List;

import butterknife.Bind;
import butterknife.ButterKnife;

public class MainActivity extends AppCompatActivity {

    @Bind(R.id.rv_words)
    RecyclerView rvWords;

    @Bind(R.id.txtLoading)
    TextView txtLoading;

    private Context context;
    private List<Word> words;

    private ContentResolver contentResolver;
    private SharedPreferences sPreferences;
    private WordRestService wordRestService;
    private static final String TAG = "MainActivity";

    private BroadcastReceiver updateUi = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            loadData(true);
        }
    };


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);

        init();
    }

    @Override
    protected void onResume() {
        super.onResume();
        LocalBroadcastManager.getInstance(getApplicationContext()).registerReceiver(updateUi,
                new IntentFilter(AppConstants.UPDATE_UI));
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Unregister since the activity is not visible
        LocalBroadcastManager.getInstance(getApplicationContext()).unregisterReceiver(updateUi);
    }

    /**
     * initialize parameters
     */
    private void init() {

        context = getApplicationContext();

        LinearLayoutManager linearLayoutManager = new LinearLayoutManager(context);
        rvWords.setLayoutManager(linearLayoutManager);

        //if local data is their then show it
        loadData(false);
        //first time sync
        WordSyncAdapter.syncImmediately(context);
        //periodic sync
        ContentResolver.addPeriodicSync(
                WordSyncAdapter.getSyncAccount(context),
                getString(R.string.content_authority),
                Bundle.EMPTY,
                AppConstants.SYNC_INTERVAL);
        ContentResolver.setSyncAutomatically(WordSyncAdapter.getSyncAccount(context),
                getString(R.string.content_authority), true);
    }

    /**
     * load data
     */
    private void loadData(boolean changeLoadingMessage) {
        words = Word.getAll();
        Log.d(TAG, "size "+words.size());
        if (words.size() > 0) {
            rvWords.setVisibility(View.VISIBLE);
            txtLoading.setVisibility(View.GONE);

            WordsAdapter wordsAdapter = new WordsAdapter(context, words);
            rvWords.setAdapter(wordsAdapter);
        }
        else {
            rvWords.setVisibility(View.GONE);
            txtLoading.setVisibility(View.VISIBLE);
            if (changeLoadingMessage)
                txtLoading.setText("No Data Available");
        }
    }
}
