"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates your application.
"""

from app import app, db, login_manager
from flask import render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, current_user, login_required
from app.forms import *
from app.models import *
from werkzeug.security import check_password_hash, generate_password_hash
from flask.json import jsonify
from datetime import datetime



###
# Routing for your application.
###


@app.route("/api/register", methods=["POST"])
def register():
    # if current_user.is_authenticated:
    #     return redirect(url_for('secure_page'))

    form = RegistrationForm()
    if request.method == "POST":
        #if form.validate_on_submit():
            # include security checks #
        username = request.form['username']
        password = request.form['password']
        name = request.form['name']
        email = request.form['email']
        location = request.form['location']
        biography = request.form['biography']
        photo = request.form['photo']
        date_joined = currentDate()

        # db access
        user = UserProfile(username, password, name, email, location, biography, photo, date_joined)
        db.session.add(user)
        db.session.commit()

        # extract user attributes into data dictionary for parsing
        data = {'id':user.get_id()}
        for k, v in user.__dict__.items():
            if k != '_sa_instance_state' and k != 'password':
                data[k] = v

        response = jsonify(data)
        flash('Registered successfully', 'success')
        login_user(user)    # load user into session
        return response
        # else:
        #     flash_errors(form)
    return render_template("registration_form.html", form=form)


@app.route("/api/auth/login", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('secure_page'))

    form = LoginForm()
    if request.method == "POST":
        if form.validate_on_submit():
            # include security checks #
            username = request.form['username']
            password = request.form['password']

            # db access
            user = UserProfile.query.filter_by(username=username).first()

            # validate the password and ensure that a user was found
            if user is not None and check_password_hash(user.password, password):
                login_user(user)
                flash(f'Hey, {username}!', 'success')
                response = jsonify(
                    {
                    "username": username,
                    }
                )
                return response
            else:
                flash('Username or Password is incorrect.', 'danger')
        else:
            flash_errors(form)
    return render_template("login.html", form=form)


@app.route("/api/auth/logout")
@login_required
def logout():
    """Logs out the user and ends the session"""
    logout_user()
    flash('You have been logged out.', 'danger')
    return redirect(url_for('home'))


@app.route("/api/cars", methods=["GET"])
@login_required
def getCars():
    """Render website's home page."""
    return ''


@app.route("/api/cars", methods=["POST"])
@login_required
def addCar():
    """Render the website's about page."""
    return ''


@app.route("/api/cars/<car_id>", methods=["GET"])
@login_required
def getCar(car_id):
    """Render a page on our website that only logged in users can access."""
    return ''

@app.route("/api/cars/<car_id>/favourite", methods=["POST"])
@login_required
def addFavourite(car_id):
    """Render a page on our website that only logged in users can access."""
    return ''

@app.route("/api/search", methods=["GET"])
@login_required
def search():
    """Render a page on our website that only logged in users can access."""
    return ''

@app.route("/api/users/<user_id>", methods=["GET"])
@login_required
def getUser(user_id):
    """Render a page on our website that only logged in users can access."""
    return ''

@app.route("/api/users/<user_id>/favourites", methods=["GET"])
def getFavourites(user_id):
    """Render a page on our website that only logged in users can access."""
    return ''

@app.route('/secure-page')
@login_required
def secure_page():
    """Render a page on our website that only logged in users can access."""
    return render_template('secure_page.html')

##############
# Vue Routes #
##############

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/register')
def registrationForm():
    return render_template('home.html')

@app.route('/login')
def vueLogin():
    return render_template('login.html')

@app.route('/logout')
def vueLogout():
    logout_user()
    flash('You have been logged out.', 'danger')
    return redirect(url_for('home'))


# user_loader callback. This callback is used to reload the user object from
# the user ID stored in the session
@login_manager.user_loader
def load_user(id):
    return UserProfile.query.get(int(id))

# Flash errors from the form if validation fails with Flask-WTF
# http://flask.pocoo.org/snippets/12/
def flash_errors(form):
    for field, errors in form.errors.items():
        for error in errors:
            flash(u"Error in the %s field - %s" % (
                getattr(form, field).label.text, error), 'danger')


###
# The functions below should be applicable to all Flask apps.
###

def currentDate():
    return datetime.now().strftime("%Y-%m-%d, %H:%M:%S")


@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send your static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="8080")
