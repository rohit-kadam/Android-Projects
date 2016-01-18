package com.mpdemo.model;

import com.activeandroid.Model;
import com.activeandroid.annotation.Column;
import com.activeandroid.annotation.Table;
import com.activeandroid.query.Select;

import java.util.List;

/**
 * Created by rohit on 15/1/16.
 */
@Table(name = "User")
public class User extends Model {
    @Column(name = "email")
    public String email;

    @Column(name = "password")
    public String password;

    public static boolean isDuplicateEmail(String email) {
        User user = new Select()
                        .from(User.class)
                        .where("email = ?", email)
                        .executeSingle();
        return (user != null) ? true : false;
    }

    public static boolean isValidUserLogin(String email, String password) {
        User user = new Select()
                .from(User.class)
                .where("email = ? AND password = ?", email, password)
                .executeSingle();
        return (user != null) ? true : false;
    }

    public static List<User> getAllUser() {
        return new Select()
                .from(User.class)
                .execute();
    }
}
