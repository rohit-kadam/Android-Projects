package com.mpdemo.model;

import com.activeandroid.Model;
import com.activeandroid.annotation.Column;
import com.activeandroid.annotation.Table;

/**
 * Created by rohit on 17/1/16.
 */
@Table(name = "UserSpentTooTime")
public class UserSpentTooTime extends Model {
    @Column(name = "email")
    public String email;

    @Column(name = "latitude")
    public String latitude;

    @Column(name = "longitude")
    public String longitude;

    @Column(name = "createdDate")
    public String createdDate;
}
