package com.mpdemo.validations;

/**
 * Created by rohit on 15/1/16.
 */
public class CommonValidation {

    public static final String emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+";

    public static boolean isInputBlank(String input) {
        if (input.trim().equals(""))
            return true;
        return false;
    }

    public static boolean isValidEmailAddress(String input) {
        if (input.matches(emailPattern))
            return true;
        return false;
    }
}
