package com.demo3.models;

import com.activeandroid.Model;
import com.activeandroid.annotation.Column;
import com.activeandroid.annotation.Table;
import com.activeandroid.query.Delete;
import com.activeandroid.query.Select;
import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Created by rohit on 26/02/16.
 */
@Table(name = "Word")
public class Word extends Model {

    @Expose
    @SerializedName("id")
    @Column(name = "wordId")
    public int wordId;

    @Expose
    @SerializedName("word")
    @Column(name = "word")
    public String word;

    @Expose
    @SerializedName("variant")
    @Column(name = "variant")
    public int variant;

    @Expose
    @SerializedName("meaning")
    @Column(name = "meaning")
    public String meaning;

    @Expose
    @SerializedName("ratio")
    @Column(name = "ratio")
    public double ratio;

    public Word(){
        super();
    }

    public Word(int wordId, String word, int variant, String meaning, double ratio) {
        super();
        this.wordId = wordId;
        this.word = word;
        this.variant = variant;
        this.meaning = meaning;
        this.ratio = ratio;
    }

    public int getWordId() {
        return wordId;
    }

    public void setWordId(int wordId) {
        this.wordId = wordId;
    }

    public String getWord() {
        return word;
    }

    public void setWord(String word) {
        this.word = word;
    }

    public int getVariant() {
        return variant;
    }

    public void setVariant(int variant) {
        this.variant = variant;
    }

    public String getMeaning() {
        return meaning;
    }

    public void setMeaning(String meaning) {
        this.meaning = meaning;
    }

    public double getRatio() {
        return ratio;
    }

    public void setRatio(double ratio) {
        this.ratio = ratio;
    }

    public static List<Word> getAll() {
        return new Select()
                .from(Word.class)
                .execute();
    }

    public static void deleteAll() {
        new Delete().from(Word.class).execute();
    }
}
