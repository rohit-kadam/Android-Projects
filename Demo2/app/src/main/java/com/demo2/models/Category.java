package com.demo2.models;

import com.activeandroid.Model;
import com.activeandroid.annotation.Column;
import com.activeandroid.annotation.Table;
import com.activeandroid.query.Select;

import java.util.List;

/**
 * Created by rohit on 04/02/16.
 */
@Table(name = "Category")
public class Category extends Model {
    @Column(name = "product_id")
    public String productId;

    @Column(name = "brand")
    public String brand;

    @Column(name = "molecule")
    public String molecule;

    @Column(name = "mrp")
    public String mrp;

    @Column(name = "margin")
    public String margin;

    @Column(name = "manufacturer")
    public String manufacturer;

    @Column(name = "scheme")
    public String scheme;

    @Column(name = "order_quantity")
    public String orderQuantity;

    @Column(name = "scheme_last_date")
    public String schemeLastDate;

    public static List<Category> getAll(String orderBy) {
        return new Select()
                .from(Category.class)
                .orderBy("scheme_last_date "+orderBy)
                .execute();
    }
}
