package com.mpdemo.activity;

import android.content.Intent;
import android.support.design.widget.CoordinatorLayout;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.activeandroid.ActiveAndroid;
import com.mpdemo.R;
import com.mpdemo.model.User;
import com.mpdemo.model.UserLoginHistory;
import com.mpdemo.service.TimeService;
import com.mpdemo.utils.AppContants;
import com.mpdemo.utils.CommonMethods;
import com.mpdemo.validations.CommonValidation;
import com.nispok.snackbar.Snackbar;

import butterknife.Bind;
import butterknife.ButterKnife;
import butterknife.OnClick;

/**
 * A login screen that offers login via email/password.
 */
public class LoginActivity extends AppCompatActivity {

    @Bind(R.id.email)
    EditText edtEmail;

    @Bind(R.id.password)
    EditText edtPassword;

    private String errorMessage = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        ButterKnife.bind(this);
    }

    @OnClick(R.id.email_sign_in_button)
    public void doSignIn(Button button) {
        if (hasFieldsValidateSuccessfully()) {
            if (User.isValidUserLogin(edtEmail.getText().toString(), edtPassword.getText().toString())) {

                CommonMethods.setSharedPreferences(getApplicationContext(),
                                                        AppContants.mPrefNameUserEmail, edtEmail.getText().toString());

                //save user login details with place
                UserLoginHistory.saveUserLoginHistory(this, edtEmail.getText().toString());

                //on all validation success move user to DashboardActivity
                Intent intent = new Intent(this, DashboardActivity.class);
                startActivity(intent);
                finish();
            }
            else {
                Snackbar.with(getApplicationContext()).text(getString(R.string.error_incorrect_details)).show(this);
            }
        }
        else {
            Snackbar.with(getApplicationContext()).text(errorMessage).show(this);
        }
    }

    @OnClick(R.id.email_sign_up_button)
    public void doSignUp(Button button) {
        if (hasFieldsValidateSuccessfully()) {
            User user = new User();
            if(!User.isDuplicateEmail(edtEmail.getText().toString())) {
                user.email = edtEmail.getText().toString();
                user.password = edtPassword.getText().toString();
                user.save();
                Snackbar.with(getApplicationContext()).text(getString(R.string.success_on_user_register)).show(this);
            }
            else {
                Snackbar.with(getApplicationContext()).text(getString(R.string.error_duplicate_email)).show(this);
            }
        }
        else {
            Snackbar.with(getApplicationContext()).text(errorMessage).show(this);
        }
    }

    /**
     * all fields validation here
     * @return boolean
     */
    private boolean hasFieldsValidateSuccessfully() {
        String email = edtEmail.getText().toString();
        String password = edtPassword.getText().toString();

        //blank check
        if (CommonValidation.isInputBlank(email) ||
                CommonValidation.isInputBlank(password)) {
            errorMessage = getString(R.string.error_field_required);
            return false;
        }

        //email validation
        if (!CommonValidation.isValidEmailAddress(email)) {
            errorMessage = getString(R.string.error_invalid_email);
            return false;
        }

        //Sign In / Sign Up between 9 AM and 7 PM
        if (CommonMethods.getHours() >= AppContants.mAfter_19 ||
                CommonMethods.getHours() < AppContants.mBefore_9 ||
                CommonMethods.isTodaySunday()) {
            errorMessage = getString(R.string.error_login_9_to_7);
            return false;
        }

        return true;
    }
}

