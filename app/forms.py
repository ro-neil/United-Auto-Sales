from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SelectField, DecimalField
from wtforms.validators import InputRequired, DataRequired
from flask_wtf.file import FileField, FileAllowed, FileRequired


class LoginForm(FlaskForm):
    username = StringField('Username', validators=[InputRequired()])
    password = PasswordField('Password', validators=[InputRequired()])

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[InputRequired()])
    fullname = StringField('Fullname', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired()])
    location = StringField('Location', validators=[DataRequired()])
    biography = TextAreaField('Biography', validators=[DataRequired()])
    photo = FileField('Upload Photo', validators=[
        FileRequired(),
        FileAllowed(['jpg', 'jpeg', 'png'], 'Images only!')
    ])

class NewCarForm(FlaskForm):
    make = StringField('Make', validators=[DataRequired()])
    model = StringField('Model', validators=[DataRequired()])
    colour = StringField('Colour', validators=[DataRequired()])
    year = StringField('Year', validators=[DataRequired()])
    price = DecimalField('Price', validators=[DataRequired()])
    carType = SelectField('Car Type',
        choices=['SUV', 'Sedan','Coupe','Hatchback','Van','Minivan','Pickup','Convertable','Wagon','Truck', ],
        validators=[DataRequired()]
    )
    transmission = SelectField('Transmission',
        choices=['Automatic', 'Manual'],
        validators=[DataRequired()]
    )
    description = TextAreaField('Description', validators=[DataRequired()])
    photo = FileField('Photo',
        validators=[FileRequired(), FileAllowed(['jpg', 'jpeg', 'png'], 'Images only!')]
    )

