package com.demo2.activities;

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.TabLayout;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v4.view.ViewPager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;

import com.demo2.R;
import com.demo2.adapters.CategoriesPagerAdapter;
import com.demo2.fragments.CategoryFragment;
import com.demo2.utils.AppConstants;

public class MainActivity extends AppCompatActivity {

    private CategoriesPagerAdapter mCategoriesPagerAdapter;

    /**
     * The {@link ViewPager} that will host the section contents.
     */
    private ViewPager mViewPager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        mCategoriesPagerAdapter = new CategoriesPagerAdapter(getSupportFragmentManager());
        addFragments();

        // Set up the ViewPager with the sections adapter.
        mViewPager = (ViewPager) findViewById(R.id.container);
        mViewPager.setAdapter(mCategoriesPagerAdapter);

        TabLayout tabLayout = (TabLayout) findViewById(R.id.tabs);
        tabLayout.setupWithViewPager(mViewPager);
    }

    private void addFragments() {
        mCategoriesPagerAdapter.addFragment(CategoryFragment.newInstance("Products"), "Products");
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }
        else if (id == R.id.action_sld_asc) {

            Intent broadcastIntent = new Intent();
            broadcastIntent.setAction(AppConstants.SORT_RECEIVER_INTENT_NANE);
            broadcastIntent.putExtra("orderBy", "ASC");
            LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(broadcastIntent);

            return true;
        }
        else if (id == R.id.action_sld_desc) {

            Intent broadcastIntent = new Intent();
            broadcastIntent.setAction(AppConstants.SORT_RECEIVER_INTENT_NANE);
            broadcastIntent.putExtra("orderBy", "DESC");
            LocalBroadcastManager.getInstance(getApplicationContext()).sendBroadcast(broadcastIntent);

            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
