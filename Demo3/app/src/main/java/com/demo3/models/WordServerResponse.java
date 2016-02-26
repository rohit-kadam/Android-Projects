package com.demo3.models;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;

/**
 * Created by rohit on 26/02/16.
 */
public class WordServerResponse {
    @Expose
    @SerializedName("version")
    public int version;

    @Expose
    @SerializedName("words")
    public ArrayList<Word> words;

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public ArrayList<Word> getWords() {
        return words;
    }

    public void setWords(ArrayList<Word> words) {
        this.words = words;
    }
}
