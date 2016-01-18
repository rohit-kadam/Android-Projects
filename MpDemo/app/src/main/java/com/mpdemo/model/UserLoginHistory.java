package com.mpdemo.model;

import android.content.Context;

import com.activeandroid.Model;
import com.activeandroid.annotation.Column;
import com.activeandroid.annotation.Table;
import com.activeandroid.query.Select;
import com.mpdemo.service.GPSTrackerService;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;

import java.util.List;

/**
 * Created by rohit on 17/1/16.
 */
@Table(name = "UserLoginHistory")
public class UserLoginHistory extends Model {
    @Column(name = "email")
    public String email;

    @Column(name = "latitude")
    public String latitude;

    @Column(name = "longitude")
    public String longitude;

    @Column(name = "createdDate")
    public String createdDate;

    public static void saveUserLoginHistory(Context context, String email) {
        try {
            GPSTrackerService gpsTracker = new GPSTrackerService(context);
            double latitude = gpsTracker.getLatitude();
            double longitude = gpsTracker.getLongitude();
            if (latitude != 0.0 && longitude != 0.0) {
                UserLoginHistory userLoginHistory = new UserLoginHistory();
                userLoginHistory.email = CommonMethods.getSharedPreferences(context, AppContants.mPrefNameUserEmail);
                userLoginHistory.latitude = ""+latitude;
                userLoginHistory.longitude = ""+longitude;
                userLoginHistory.createdDate = CommonMethods.getCurrentDateTime();
                userLoginHistory.save();
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static List<UserLoginHistory> getAllUserTrackingByEmail(String email) {
        return new Select()
                .from(UserLoginHistory.class)
                .where("email = ?", email)
                .orderBy("createdDate DESC")
                .execute();
    }
}
