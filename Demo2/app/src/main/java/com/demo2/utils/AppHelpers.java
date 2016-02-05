package com.demo2.utils;

import android.content.Context;

import java.io.IOException;
import java.io.InputStream;

/**
 * Created by rohit on 04/02/16.
 */
public class AppHelpers {
    public static String getSampleData(Context contex) {
        return getRawString(contex, "sample_data");
    }

    public static String getRawString(Context context, String resourceName) {
        try {
            InputStream inputStream = context.getResources().openRawResource(context.getResources()
                    .getIdentifier(resourceName, "raw", context.getPackageName()));
            int size = inputStream.available();
            byte[] buffer = new byte[size];
            inputStream.read(buffer);
            inputStream.close();
            String rawString = new String(buffer);
            return rawString;
        }
        catch (IOException ex) {
        }
        return null;
    }
}
