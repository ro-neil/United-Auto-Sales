from . import db
from werkzeug.security import generate_password_hash
from flask_login._compat import unicode


class User(db.Model):
    # You can use this to change the table name. The default convention is to use
    # the class name. In this case a class name of User would create a
    # user_profile (singular) table, but if we specify __tablename__ we can change it
    # to `Users` (plural) or some other name.
    __tablename__ = 'Users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.String(255))
    name = db.Column(db.String(80))
    email = db.Column(db.String(80))
    location = db.Column(db.String(120))
    biography = db.Column(db.String(1000))
    photo = db.Column(db.String(100))
    date_joined = db.Column(db.DateTime())

    def __init__(self, username, password, name, email, location, biography, photo, date_joined):
        self.username = username
        self.password = generate_password_hash(password, method='pbkdf2:sha256')
        self.name = name
        self.email = email
        self.location = location
        self.biography = biography
        self.photo = photo
        self.date_joined = date_joined
    
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<User %r>' % (self.username)
        

class Car(db.Model):
    
    __tablename__ = 'Cars'

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(1000))
    make = db.Column(db.String(25))
    model = db.Column(db.String(50))
    colour = db.Column(db.String(25))
    year = db.Column(db.String(4))
    transmission = db.Column(db.String(25))
    car_type = db.Column(db.String(25))
    photo = db.Column(db.String(150))
    user_id = db.Column(db.Integer)
    price = db.Column(db.Float)

    def __init__(self,description,make,model,colour,year,transmission,car_type,photo,user_id,price):
        self.description = description
        self.make = make
        self.model = model
        self.colour = colour
        self.year = year
        self.transmission = transmission
        self.car_type = car_type
        self.photo = photo
        self.user_id = user_id
        self.price = price

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<Car %r %r>' % (self.make, self.model)


class Favourite(db.Model):

    __tablename__ = 'Favourites'

    car_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, primary_key=True)

    def __init__(self,car_id,user_id):
        self.car_id = car_id
        self.user_id = user_id

    def get_id(self):
        try:
            return unicode((self.car_id, self.user_id))  # python 2 support
        except NameError:
            return str((self.car_id, self.user_id))  # python 3 support

    def __repr__(self):
        return '<Favourite %r %r>' % (self.user_id, self.car_id)