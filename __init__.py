from database_setup import Base, Questions, Choices, UserStatus

import datetime
from flask import Flask, render_template, request
from flask import redirect, jsonify, url_for
from flask import abort, make_response, g
from flask import session as login_session
from flask_cors import CORS
import json
import random
import requests
from sqlalchemy import create_engine, asc, desc
from sqlalchemy.orm import sessionmaker
import string
import uuid


app = Flask(__name__)
cors = CORS(app, resources={r"/v1/*": {"origins": "*"}})


# For postgresql connection
engine = create_engine(
            'postgresql+psycopg2://mychoice:mychoice@localhost/mychoice')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


# Create anti-forgery state token
@app.route('/')
@app.route('/v1/login')
def showLogin():
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in xrange(32))
    login_session['state'] = state
    return render_template('index.html', STATE=state)


# Return all questions
@app.route('/v1/questions/')
def returnQuestions():
    questions = session.query(Questions).order_by(desc(Questions.posted_on))
    return jsonify(questions=[q.serialize for q in questions])


# Post question and choices to db
@app.route('/v1/postquestion/', methods=['POST'])
def postQuestion():
    try:
        questionChoices = request.get_json(force=True)
        question = questionChoices["question"]
        choice1 = questionChoices["choice1"]
        choice2 = questionChoices["choice2"]
        choice3 = questionChoices["choice3"]
        choice4 = questionChoices["choice4"]

        questionUuid = str(uuid.uuid4())
        newQuestion = Questions(
                        id = questionUuid, question = question, posted_by = "Me", posted_on = datetime.datetime.now())
        session.add(newQuestion)

        choice1 = Choices(
                    id=str(uuid.uuid4()), question_id = questionUuid, choice = choice1, votes = 0)
        session.add(choice1)

        choice2 = Choices(
                    id=str(uuid.uuid4()), question_id = questionUuid, choice = choice2, votes = 0)
        session.add(choice2)

        choice3 = Choices(
                    id=str(uuid.uuid4()), question_id = questionUuid, choice = choice3, votes = 0)
        session.add(choice3)

        choice4 = Choices(
                    id=str(uuid.uuid4()), question_id = questionUuid, choice= choice4, votes = 0)
        session.add(choice4)


        session.commit()

        return "success"

    except Exception, ex:
        return "fail"


if __name__ == '__main__':
    app.secret_key = 'super_secret_key'
    app.debug = True
    app.run()
