package com.demo2.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import com.demo2.R;
import com.demo2.models.Category;

import java.util.List;

/**
 * Created by rohit on 04/02/16.
 */
public class CategoryAdapter extends BaseAdapter {

    private List<Category> listCategory;
    private Context context;

    public CategoryAdapter(Context context, List<Category> listCategory) {
        this.context = context;
        this.listCategory = listCategory;
    }

    @Override
    public int getCount() {
        return listCategory.size();
    }

    @Override
    public Category getItem(int position) {
        return listCategory.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        View v = null;
        ViewHolder holder;
        Category category = listCategory.get(position);

        if (convertView == null) {
            v = LayoutInflater.from(context).inflate(R.layout.category_item, parent, false);
            holder = new ViewHolder();

            holder.txtBrand = (TextView) v.findViewById(R.id.txtBrand);
            holder.txtManufacturer = (TextView) v.findViewById(R.id.txtManufacturer);
            holder.txtMrp = (TextView) v.findViewById(R.id.txtMrp);
            holder.txtScheme = (TextView) v.findViewById(R.id.txtScheme);
            holder.txtSchemeLastDate = (TextView) v.findViewById(R.id.txtSchemeLastDate);

            v.setTag(holder);
        }
        else {
            v = convertView;
            holder = (ViewHolder) v.getTag();
        }

        holder.txtBrand.setText(category.brand);
        holder.txtManufacturer.setText(category.manufacturer);
        holder.txtMrp.setText(category.mrp);
        holder.txtScheme.setText((category.scheme.equals("null") ? "NA" : category.scheme));
        holder.txtSchemeLastDate.setText(category.schemeLastDate);

        return v;
    }

    private class ViewHolder {
        public TextView txtBrand;
        public TextView txtManufacturer;
        public TextView txtMrp;
        public TextView txtScheme;
        public TextView txtSchemeLastDate;
    }
}
