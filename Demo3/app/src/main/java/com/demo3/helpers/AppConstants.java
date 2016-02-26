package com.demo3.helpers;

/**
 * Created by rohit on 26/02/16.
 */
public class AppConstants {
    public static final String SERVER_BASE_URL = "http://appsculture.com/";

    public static final String LOCAL_DB_VERSION = "local_db_version";

    public static final String UPDATE_UI = "update_ui";

    public static final int SYNC_INTERVAL = 60; //1 min

    public static String getWordsApiUrl() {
        return SERVER_BASE_URL+"vocab/words.json";
    }

    public static String getImagesApiUrl(String imageFileName) {
        return SERVER_BASE_URL+"vocab/images/"+imageFileName;
    }
}