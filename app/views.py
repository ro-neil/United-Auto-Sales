"""
Flask Documentation:     http://flask.pocoo.org/docs/
Jinja2 Documentation:    http://jinja.pocoo.org/2/documentation/
Werkzeug Documentation:  http://werkzeug.pocoo.org/documentation/
This file creates your application.
"""

from app import app, db, login_manager
from flask import render_template, request, redirect, url_for, flash, g, _request_ctx_stack
from flask_login import login_user, logout_user, current_user, login_required
from app.forms import *
from app.models import *
from werkzeug.security import check_password_hash, generate_password_hash
from flask.json import jsonify
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import jwt
from sqlalchemy import and_
from functools import wraps
from flask.helpers import send_from_directory


CAR_DIR = "/uploads/cars/"
USER_DIR = "/uploads/users/"


# Create a JWT @requires_auth decorator
# This decorator can be used to denote that a specific route should check
# for a valid JWT token before displaying the contents of that route.
def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    auth = request.headers.get('Authorization', None) # or request.cookies.get('token', None)

    if not auth:
      return jsonify({'code': 'authorization_header_missing', 'description': 'Authorization header is expected'}), 401

    parts = auth.split()

    if parts[0].lower() != 'bearer':
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must start with Bearer'}), 401
    elif len(parts) == 1:
      return jsonify({'code': 'invalid_header', 'description': 'Token not found'}), 401
    elif len(parts) > 2:
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must be Bearer + \s + token'}), 401

    token = parts[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])

    except jwt.ExpiredSignatureError:
        return jsonify({'code': 'token_expired', 'description': 'token is expired'}), 401
    except jwt.DecodeError:
        return jsonify({'code': 'token_invalid_signature', 'description': 'Token signature is invalid'}), 401

    g.current_user = user = payload
    return f(*args, **kwargs)

  return decorated

###
# Routing for the application.
###

@app.route("/api/register", methods=["POST"])
def register():
    """ Register a user """
    # if current_user.is_authenticated:
    #     return redirect(url_for('secure_page'))

    form = RegistrationForm()

    if form.validate_on_submit():
        # include security checks #
        username = request.form['username']
        password = request.form['password']
        name = request.form['fullname']
        email = request.form['email']
        location = request.form['location']
        biography = request.form['biography']
        photo = request.files['photo']
        photo_name = secure_filename(photo.filename)
        photo.save(os.path.join(app.config['USERS_FOLDER'], photo_name))
        date_joined = currentDate()

        # db access
        user = User(username, password, name, email, location, biography, photo_name, date_joined)
        if User.query.filter_by(username=username).first(): # if username already exist
            response = jsonify({'error':'Try a different username or contact the administrator.'})
            return response
        db.session.add(user)
        db.session.commit()

        # convert sqlalchemy user object to dictionary object for JSON parsing
        data = obj_to_dict(user)
        data.pop('password')
        response = jsonify(data)
        return response
    else:
        response = jsonify(form.errors)
        return response


@app.route("/api/auth/login", methods=["POST"])
def login():
    """ Login a user """
    # if current_user.is_authenticated:
    #     return redirect(url_for('secure_page'))

    form = LoginForm()
    if form.validate_on_submit():
        # include security checks #
        username = request.form['username']
        password = request.form['password']

        # db access
        user = User.query.filter_by(username=username).first()
        
    
        # validate the password and ensure that a user was found
        if user is not None and check_password_hash(user.password, password):
            login_user(user)
            payload = {
                "sub": "352741018090",
                "name": username,
                "issue": currentDate()
            }
            encoded_jwt = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
            response = jsonify({"message": "Login Successful", 'token':encoded_jwt, 'user_id':user.id}) # Hash user_id before sending
            return response
        else:
            response = jsonify({'error':'Username or Password is incorrect.'})
            return response
    else:
        response = jsonify(form.errors)
        return response


@app.route("/api/auth/logout", methods=["POST"])
@requires_auth
def logout():
    """Logs out the user and ends the session"""

    try:
        logout_user()
    except Exception:
        return 'Access token is missing or invalid, 401'

    response = jsonify({"message": "Log out successful"})
    return response


@app.route("/api/cars", methods=["GET"])
@requires_auth
def getCars():
    """ Get a list of all cars available for sale """

    cars = db.session.query(Car).all()
    if cars is None:
        return jsonify(message="No cars available")

    carsData = []
    for car in cars:
        # convert sqlalchemy car object to a dictionary object
        carObj = obj_to_dict(car)
        carObj['photo'] = f"{CAR_DIR}{carObj['photo']}"
        carObj['price'] = numberFormatter(carObj['price'])
        carsData.append(carObj)
    response = jsonify(carsData)
    return response


@app.route("/api/cars", methods=["POST"])
@requires_auth
def addCar():
    """ Add a new car """

    # if current_user.is_authenticated:
    #     return redirect(url_for('secure_page'))

    form = NewCarForm()

    if form.validate_on_submit():
        # include security checks #
    
        description = request.form['description']
        make = request.form['make']
        model = request.form['model']
        colour = request.form['colour']
        year = request.form['year']
        transmission = request.form['transmission']
        carType = request.form['carType']
        photo = request.files['photo']
        photo_name = secure_filename(photo.filename)
        photo.save(os.path.join(app.config['CARS_FOLDER'], photo_name))
        user_id = current_user.get_id()
        price = float(request.form['price'])

        # db access
        car = Car(description, make, model, colour, year, transmission, carType, photo_name, user_id, price)
        db.session.add(car)
        db.session.commit()

        # convert sqlalchemy car object to dictionary object for JSON parsing
        car = obj_to_dict(car)
        car.pop('id')   # remove id
        carType = car.pop('car_type')
        car['type'] = carType   # change key 'car_type' to 'type'
        response = jsonify(car)
        return response
    else:
        response = jsonify(form.errors)
        return response


@app.route("/api/cars/<int:car_id>", methods=["GET"])
@requires_auth
def getCar(car_id):
    """ View details of a specific car """

    car = Car.query.get(car_id)
    if car is None:
        return jsonify(message="Car not found")
    carObj = obj_to_dict(car)
    carObj['photo'] = f"{CAR_DIR}{carObj['photo']}"
    carObj['price'] = numberFormatter(carObj['price'])
    return jsonify(carObj)


@app.route("/api/cars/<int:car_id>/remove", methods=["POST"])
@requires_auth
def removeCar(car_id):
    """ Deletes a specific car """

    car = Car.query.get(car_id)
    if car is None:
        return jsonify(message="Car not found")

    if str(car.user_id) == current_user.get_id():
        path = os.path.join(app.config['CARS_FOLDER'], car.photo)
        os.remove(path)
        
        db.session.delete(car)
        db.session.commit()
        
        return jsonify(message="Car Removed Successfully")

    return jsonify(message="Not allowed")


@app.route("/api/cars/<int:car_id>/favourite", methods=["POST"])
@requires_auth
def addFavourite(car_id):
    """ Favourites a specific car """

    if Favourite.query.get((car_id,current_user.get_id())):
        return jsonify({"message":"Car already favourited"})
        
    favourite = Favourite(car_id, current_user.get_id())
    db.session.add(favourite)
    db.session.commit()

    response = {
        "message": "Car Successfully Favourited",
        "car_id": car_id
    }
    return jsonify(response)


@app.route("/api/search", methods=["GET"])
@requires_auth
def search():
    """ Search for cars based on their make or model """

    # include security checks #
    make = request.args.get('make')
    model = request.args.get('model')
    
    cars = []
    if make and model:
        cars = Car.query.filter_by(make=make, model=model)
    elif make:
        cars = Car.query.filter_by(make=make)
    elif model:
        cars = Car.query.filter_by(model=model)
    else:
        return getCars()

    data = []
    for car in cars:
        carObj = obj_to_dict(car)
        carObj['photo'] = f"{CAR_DIR}{carObj['photo']}"
        carObj['price'] = numberFormatter(carObj['price'])
        data.append(carObj)
    
    return jsonify(data)


@app.route("/api/users/<int:user_id>", methods=["GET"])
@login_required
def getUser(user_id):   # Unhash user id
    """ Get details for a specific user """
    if str(user_id) != current_user.get_id():
        return jsonify(message="Invalid Request")

    user = User.query.get(user_id)
    if user is None:
        return jsonify(message="User not found")
    
    user = obj_to_dict(user)
    user['date_joined'] = user['date_joined'].strftime("%b %d, %Y") # reformat date
    user['photo'] = f"{USER_DIR}{user['photo']}"    # user_directory + path_to_user_photo
    user.pop('password')
    return jsonify(user)


@app.route("/api/users/<int:user_id>/favourites", methods=["GET"])
@requires_auth
def getFavourites(user_id):
    """ Get the cars favourited by a user """
    if str(user_id) != current_user.get_id():
        return jsonify(message="Invalid request")

    favourites = Favourite.query.filter_by(user_id=user_id).all()
    if favourites is None:
        return jsonify(message="Favourites not found")

    data = []
    for favourite in favourites:
        car_id = obj_to_dict(favourite)['car_id']
        car = Car.query.get(car_id)

        # Remove car from Favourites if not found, car most likely deleted by the owner.
        if car is None:
            car = Favourite.query.filter_by(car_id=car_id).first()
            db.session.delete(car)
            db.session.commit()
        else:
            carObj = obj_to_dict(car)
            carObj['photo'] = f"{CAR_DIR}{carObj['photo']}"
            carObj['price'] = numberFormatter(carObj['price'])

            data.append(carObj)
    return jsonify(data)



# Please create all new routes and view functions above this route.
# This route is now our catch all route for our VueJS single page
# application.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    """
    Because we use HTML5 history mode in vue-router we need to configure our
    web server to redirect all routes to index.html. Hence the additional route
    "/<path:path".

    Also we will render the initial webpage and then let VueJS take control.
    """
    return render_template('index.html')


# user_loader callback. This callback is used to reload the user object from
# the user ID stored in the session
@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

# Flash errors from the form if validation fails with Flask-WTF
# http://flask.pocoo.org/snippets/12/
def flash_errors(form):
    for field, errors in form.errors.items():
        for error in errors:
            msg = f"Error in the {getattr(form, field).label.text} field - {error}"
            flash(msg, 'danger')
            

@app.route('/uploads/cars/<filename>')
def get_car_image(filename):
    root_dir = os.getcwd()
    return send_from_directory(os.path.join(root_dir, app.config['CARS_FOLDER']),filename)


@app.route('/uploads/users/<filename>')
def get_user_image(filename):
    root_dir = os.getcwd()
    return send_from_directory(os.path.join(root_dir, app.config['USERS_FOLDER']),filename)


###
# The functions below should be applicable to all Flask apps.
###

def currentDate():
    return datetime.now().strftime("%Y-%m-%d, %H:%M:%S")

def obj_to_dict(obj):
    '''Converts an sqlalchemy database object to a dictionary format'''
    data = {'id':obj.get_id()}
    for k, v in obj.__dict__.items():
        if k != '_sa_instance_state':
            data[k] = v
    return data

def numberFormatter(price, sep=','):
    '''Formats a number to include a thousandths separator'''
    price = str(price)
    pos = price.find('.') 
    if pos > 0:
        price = price[:pos]
    priceLength = len(price)
    commaPosition = priceLength % 3
    if commaPosition == 0:
        commaPosition += 3
    formattedPrice = ""  
    for i in range(0, priceLength):
        if i == commaPosition:
            formattedPrice += (sep)
            commaPosition += 3
        formattedPrice += price[i]
    return formattedPrice

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


# @app.errorhandler(404)
# def page_not_found(error):
#     """Custom 404 page."""
#     return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="8080")
