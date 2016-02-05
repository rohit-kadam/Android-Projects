package com.demo2.adapters;

import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by rohit on 04/02/16.
 */
public class CategoriesPagerAdapter extends FragmentPagerAdapter {

    /**
     * Contains all the fragments.
     */
    private List<Fragment> fragments = new ArrayList<>();

    /**
     * Contains all the tab titles.
     */
    private List<String> tabTitles = new ArrayList<>();

    public CategoriesPagerAdapter(FragmentManager fm) {
        super(fm);
    }

    @Override
    public Fragment getItem(int position) {
        return fragments.get(position);
    }

    @Override
    public int getCount() {
        return fragments.size();
    }

    @Override
    public CharSequence getPageTitle(int position) {
        return tabTitles.get(position);
    }

    /**
     * Adds the fragment to the list, also adds the fragment's tab title.
     * @param fragment New instance of the Fragment to be associated with this tab.
     * @param tabTitle A String containing the tab title for this Fragment.
     */
    public void addFragment(Fragment fragment, String tabTitle) {
        fragments.add(fragment);
        tabTitles.add(tabTitle);
    }
}
