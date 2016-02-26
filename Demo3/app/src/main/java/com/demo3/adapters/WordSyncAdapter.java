package com.demo3.adapters;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.content.AbstractThreadedSyncAdapter;
import android.content.ContentProviderClient;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.SyncResult;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.demo3.R;
import com.demo3.helpers.AppConstants;
import com.demo3.helpers.CommonMethods;
import com.demo3.interfaces.WordRestService;
import com.demo3.models.Word;
import com.demo3.models.WordServerResponse;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.GsonConverterFactory;
import retrofit2.Response;
import retrofit2.Retrofit;

/**
 * Created by rohit on 26/02/16.
 */
public class WordSyncAdapter extends AbstractThreadedSyncAdapter {

    private static final String TAG = "WordSyncAdapter";
    private ContentResolver contentResolver;
    private WordRestService wordRestService;
    private Context context;

    private void init(Context c) {
        context = c;

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(AppConstants.SERVER_BASE_URL)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build();

        wordRestService = retrofit.create(WordRestService.class);
        contentResolver = context.getContentResolver();
    }

    public WordSyncAdapter(Context context, boolean autoInitialize) {
        super(context, autoInitialize);
        init(context);
    }

    /**
     * Helper method to have the sync adapter sync immediately
     * @param context The context used to access the account service
     */
    public static void syncImmediately(Context context) {
        Bundle bundle = new Bundle();
        bundle.putBoolean(ContentResolver.SYNC_EXTRAS_EXPEDITED, true);
        bundle.putBoolean(ContentResolver.SYNC_EXTRAS_MANUAL, true);

        ContentResolver.requestSync(getSyncAccount(context),
                context.getString(R.string.content_authority), bundle);

        ContentResolver.setIsSyncable(getSyncAccount(context), context.getString(R.string.content_authority), 1);
    }

    public static Account getSyncAccount(Context context) {
        // Get an instance of the Android account manager
        AccountManager accountManager =
                (AccountManager) context.getSystemService(Context.ACCOUNT_SERVICE);

        // Create the account type and default account
        Account newAccount = new Account(
                context.getString(R.string.app_name), context.getString(R.string.sync_account_type));

        // If the password doesn't exist, the account doesn't exist
        if ( null == accountManager.getPassword(newAccount) ) {

        /*
         * Add the account and account type, no password or user data
         * If successful, return the Account object, otherwise report an error.
         */
            if (!accountManager.addAccountExplicitly(newAccount, "", null)) {
                return null;
            }
            /*
             * If you don't set android:syncable="true" in
             * in your <provider> element in the manifest,
             * then call ContentResolver.setIsSyncable(account, AUTHORITY, 1)
             * here.
             */

        }
        return newAccount;
    }

    @Override
    public void onPerformSync(Account account, Bundle extras, String authority,
                              ContentProviderClient provider, SyncResult syncResult) {
        Log.d(TAG, "onPerformSync Called.");
        try {
            Call<WordServerResponse> call = wordRestService.getWords();
            call.enqueue(new Callback<WordServerResponse>() {
                @Override
                public void onResponse(Call<WordServerResponse> call, Response<WordServerResponse> response) {
                    ArrayList<Word> words = response.body().getWords();
                    String serverDbVersion = "" + response.body().getVersion();

                    if (!CommonMethods.getSharedPreferences(context, AppConstants.LOCAL_DB_VERSION)
                            .equals(serverDbVersion)) {
                        Log.d(TAG, "NEW DB VERSION");

                        Word.deleteAll();

                        if (words.size() > 0) {
                            //save in db
                            for (Word word : words) {
                                word.save();
                            }
                            //update local db version after sync
                            CommonMethods.setSharedPreferences(context, AppConstants.LOCAL_DB_VERSION, serverDbVersion);

                            Intent intent = new Intent(AppConstants.UPDATE_UI);
                            LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
                        }
                        else {
                            Log.d(TAG, "SAME DB VERSION");
                        }
                    }
                }

                @Override
                public void onFailure(Call<WordServerResponse> call, Throwable t) {
                }
            });
        }
        catch (Exception e) {
            Log.d(TAG, "Exception in sync ", e);
            syncResult.hasHardError();
        }
    }
}
