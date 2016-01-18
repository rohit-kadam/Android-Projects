package com.mpdemo.model;

import com.activeandroid.Model;
import com.activeandroid.annotation.Column;
import com.activeandroid.annotation.Table;
import com.activeandroid.query.Select;
import com.mpdemo.utils.CommonMethods;

import java.util.List;

/**
 * Created by rohit on 15/1/16.
 */
@Table(name = "UserTracking")
public class UserTracking extends Model {
    @Column(name = "email")
    public String email;

    @Column(name = "latitude")
    public String latitude;

    @Column(name = "longitude")
    public String longitude;

    @Column(name = "createdDate")
    public String createdDate;

    public static void saveUserTracking(String email, String latitude, String longitude) {
        UserTracking userTracking = new UserTracking();
        userTracking.email = email;
        userTracking.latitude = latitude;
        userTracking.longitude = longitude;
        userTracking.createdDate = CommonMethods.getCurrentDateTime();
        userTracking.save();
    }

    public static List<UserTracking> getAllUserTrackingByEmail(String email) {
        return new Select()
                .from(UserTracking.class)
                .where("email = ?", email)
                .orderBy("createdDate DESC")
                .execute();
    }

    public static UserTracking getLastUserTrackingEntry(String email){
        return new Select()
                .from(UserTracking.class)
                .where("email = ?", email)
                .orderBy("createdDate DESC")
                .limit(1)
                .executeSingle();
    }
}
