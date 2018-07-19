from database_setup import Base, Questions, Choices, UserStatus

from flask import Flask, render_template, request
from flask import redirect, jsonify, url_for
from flask import abort, make_response, g
from flask import session as login_session
from flask_cors import CORS
import json
import requests
from sqlalchemy import create_engine, asc, desc
from sqlalchemy.orm import sessionmaker
import uuid

app = Flask(__name__)
cors = CORS(app, resources={r"/v1/*": {"origins": "*"}})


# For postgresql connection
engine = create_engine(
            'postgresql+psycopg2://mychoice:mychoice@localhost/mychoice')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


# Show all categories
@app.route('/')
@app.route('/v1/questions/')
def returnQuestions():
    questions = session.query(Questions).order_by(desc(Questions.posted_on))
    return jsonify(questions=[q.serialize for q in questions])

@app.route('/v1/postquestion/', methods=['POST'])
def postQuestion():
    print request.get_json(force=True)
    return "testing"


if __name__ == '__main__':
    app.debug = True
    app.run()
