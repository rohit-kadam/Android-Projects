package com.demo3.interfaces;

import com.demo3.models.WordServerResponse;

import retrofit2.Call;
import retrofit2.http.GET;

/**
 * Created by rohit on 26/02/16.
 */
public interface WordRestService {
    /*@GET("/words.json")
    public void getWords(Callback<List<WordServerResponse>> response);*/

    @GET("vocab/words.json")
    Call<WordServerResponse> getWords();
}
