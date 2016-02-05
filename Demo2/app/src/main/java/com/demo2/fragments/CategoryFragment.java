package com.demo2.fragments;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.support.v4.content.LocalBroadcastManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;
import android.widget.Toast;

import com.activeandroid.ActiveAndroid;
import com.demo2.R;
import com.demo2.adapters.CategoryAdapter;
import com.demo2.models.Category;
import com.demo2.utils.AppConstants;
import com.demo2.utils.AppHelpers;
import com.demo2.utils.PreferenceManager;

import org.json.JSONObject;

import java.util.Iterator;
import java.util.List;

/**
 * Created by rohit on 04/02/16.
 */
public class CategoryFragment extends Fragment {

    private static final String FRAG_ARGU_DATA = "data";
    private static final String TAG = "CategoryFragment";

    private ListView listingCategory;
    private List<Category> categories;
    private View rootView;
    private CategoryAdapter categoryAdapter;

    /**
     * receiver to sort product listing
     */
    private BroadcastReceiver sortListBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getExtras() != null) {
                Bundle bundle = intent.getExtras();
                Toast.makeText(getActivity(), "Scheme last data ("+bundle.getString("orderBy")+")", Toast.LENGTH_LONG).show();
                categories = Category.getAll(bundle.getString("orderBy"));
                categoryAdapter = new CategoryAdapter(getActivity(), categories);
                listingCategory = (ListView) rootView.findViewById(R.id.listingCategory);
                listingCategory.setAdapter(categoryAdapter);
            }
        }
    };

    public static CategoryFragment newInstance(String data) {
        CategoryFragment categoryFragment = new CategoryFragment();

        Bundle args = new Bundle();
        args.putString(FRAG_ARGU_DATA, data);
        categoryFragment.setArguments(args);

        return categoryFragment;
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.fragment_main, container, false);

        ActiveAndroid.initialize(getActivity());

        loadDataInBackground();

        return rootView;
    }

    @Override
    public void onResume() {
        super.onResume();

        LocalBroadcastManager.getInstance(getActivity())
                .registerReceiver(sortListBroadcastReceiver, new IntentFilter(AppConstants.SORT_RECEIVER_INTENT_NANE));
    }

    @Override
    public void onPause() {
        super.onPause();

        if (sortListBroadcastReceiver != null) {
            LocalBroadcastManager.getInstance(getActivity()).unregisterReceiver(sortListBroadcastReceiver);
        }
    }

    /**
     * load data in background
     */
    private void loadDataInBackground() {
        new AsyncTask<String,Void,String>(){
            @Override
            protected String doInBackground(String... params) {
                String hasAppOpenedFirstTime =
                        PreferenceManager.getStringFromPreferences(getActivity(),
                                                            "yes", AppConstants.HAS_APP_OPENED_FIRST_TIME);

                if (hasAppOpenedFirstTime.equals("yes")) {
                    //update PreferenceManager
                    PreferenceManager.putStringInPreferences(getActivity(), "no", AppConstants.HAS_APP_OPENED_FIRST_TIME);

                    //load sample data from raw folder
                    try {
                        String sampleData = AppHelpers.getSampleData(getActivity());
                        JSONObject jsonObjectSampleData = new JSONObject(sampleData);

                        //parse data
                        JSONObject jsonObjectSampleDataResponse = new JSONObject(jsonObjectSampleData.getString("data"));
                        Iterator iteratorSampleData = jsonObjectSampleDataResponse.keys();
                        while (iteratorSampleData.hasNext()) {
                            String key = iteratorSampleData.next().toString();
                            //record
                            JSONObject record = new JSONObject(jsonObjectSampleDataResponse.getString(key));

                            //and store it in db
                            Category category = new Category();
                            category.productId = record.getString("product-id");
                            category.brand = record.getString("brand");
                            category.molecule = record.getString("molecule");
                            category.mrp = record.getString("mrp");
                            category.margin = record.getString("margin");
                            category.manufacturer = record.getString("manufacturer");
                            category.scheme = record.getString("scheme");
                            category.orderQuantity = record.getString("order-quantity");
                            category.schemeLastDate = record.getString("scheme-last-date");
                            //save category
                            category.save();
                        }
                    }
                    catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                //load data from db
                categories = Category.getAll("DESC");

                return null;
            }

            @Override
            protected void onPostExecute(String s) {
                super.onPostExecute(s);

                if (categories.size() > 0) {
                    categoryAdapter = new CategoryAdapter(getActivity(), categories);
                    listingCategory = (ListView) rootView.findViewById(R.id.listingCategory);
                    listingCategory.setAdapter(categoryAdapter);
                }
            }
        }.execute();
    }
}
