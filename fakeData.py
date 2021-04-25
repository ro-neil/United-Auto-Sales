from app import db
from app.models import *
import datetime

# db.create_all()
# Add dummy data to the database from the model created
user = User("tester","test","user","test@example.com","kingston","Test user","photo.jpg",datetime.datetime.now())
db.session.add(user)
db.session.commit()
print("Users added successfully")