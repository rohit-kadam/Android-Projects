package com.demo3.adapters;

import android.content.Context;
import android.support.v7.widget.CardView;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.demo3.R;
import com.demo3.helpers.AppConstants;
import com.demo3.models.Word;
import com.squareup.picasso.Picasso;

import java.util.List;

import butterknife.Bind;
import butterknife.ButterKnife;

/**
 * Created by rohit on 26/02/16.
 */
public class WordsAdapter extends RecyclerView.Adapter<WordsAdapter.WordViewHolder> {

    private List<Word> words;
    private Context context;

    public WordsAdapter(Context context, List<Word> words){
        this.context = context;
        this.words = words;
    }

    public static class WordViewHolder extends RecyclerView.ViewHolder {
        @Bind(R.id.cv_item)
        CardView cv;

        @Bind(R.id.word_photo)
        ImageView wordPhoto;

        @Bind(R.id.word)
        TextView word;

        @Bind(R.id.word_meaning)
        TextView wordMeaning;

        WordViewHolder(View itemView) {
            super(itemView);
            ButterKnife.bind(this, itemView);
        }
    }

    @Override
    public int getItemCount() {
        return words.size();
    }

    @Override
    public WordViewHolder onCreateViewHolder(ViewGroup viewGroup, int i) {
        View v = LayoutInflater.from(viewGroup.getContext()).inflate(R.layout.item, viewGroup, false);
        WordViewHolder wordViewHolder = new WordViewHolder(v);

        return wordViewHolder;
    }

    @Override
    public void onBindViewHolder(WordViewHolder wordViewHolder, int i) {
        //current word
        Word word = words.get(i);

        //set word_image
        String imageFileName = word.getWordId()+".png";
        if (word.getRatio() != -1) {
            Picasso.with(context)
                    .load(AppConstants.getImagesApiUrl(imageFileName))
                    .error(R.drawable.no_image_available)
                    .placeholder(R.drawable.default_image_placeholder)
                    .into(wordViewHolder.wordPhoto);
        }
        else {
            wordViewHolder.wordPhoto.setImageResource(R.drawable.no_image_available);
        }
        //set word name
        wordViewHolder.word.setText(word.getWord());
        //set word_meaning
        wordViewHolder.wordMeaning.setText(word.getMeaning());
    }

    @Override
    public void onAttachedToRecyclerView(RecyclerView recyclerView) {
        super.onAttachedToRecyclerView(recyclerView);
    }
}