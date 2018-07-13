from flask import Flask, render_template, request
from flask import redirect, jsonify, url_for

from flask import abort, make_response, g
from flask import session as login_session

import json
from oauth2client.client import FlowExchangeError
from oauth2client.client import flow_from_clientsecrets
import random
import requests
from sqlalchemy import create_engine, asc, desc
from sqlalchemy.orm import sessionmaker
import string

from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()


app = Flask(__name__)

# NOTE: The 'client_secrets.json' needs to be replaced
# with full path to the file on the server
CLIENT_ID = json.loads(
    open('client_secrets.json', 'r').read())['web']['client_id']
APPLICATION_NAME = "Item Catalog Application"


# Connect to Database and create database session
# For sqlite connection
# engine = create_engine(
#     'sqlite:///transportitemswithusers.db',
#     connect_args={'check_same_thread': False})

# For postgresql connection
engine = create_engine(
            'postgresql+psycopg2://catalog:@localhost/transportitemswithusers')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


# Create anti-forgery state token
@app.route('/v1/login')
def showLogin():
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in xrange(32))
    login_session['state'] = state
    return render_template('login.html', STATE=state)


@app.route('/gconnect', methods=['POST'])
def gconnect():
    """ Authenticate user using Google oAuth2
    And if success display timeout welcome message
    before redirecting to home page
    """

    # Validate state token
    if request.args.get('state') != login_session['state']:
        response = make_response(json.dumps('Invalid state parameter.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response
    # Obtain authorization code
    code = request.data

    try:
        # Upgrade the authorization code into a credentials object
        # NOTE: The 'client_secrets.json' needs to be replaced
        # with full path to the file on the server
        oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='')
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
    except FlowExchangeError:
        response = make_response(
            json.dumps('Failed to upgrade the authorization code.'), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Check that the access token is valid.
    access_token = credentials.access_token
    url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
           % access_token)
    h = httplib2.Http()
    result = json.loads(h.request(url, 'GET')[1])
    # If there was an error in the access token info, abort.
    if result.get('error') is not None:
        response = make_response(json.dumps(result.get('error')), 500)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is used for the intended user.
    gplus_id = credentials.id_token['sub']
    if result['user_id'] != gplus_id:
        response = make_response(
            json.dumps("Token's user ID doesn't match given user ID."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Verify that the access token is valid for this app.
    if result['issued_to'] != CLIENT_ID:
        response = make_response(
            json.dumps("Token's client ID does not match app's."), 401)
        response.headers['Content-Type'] = 'application/json'
        return response

    stored_access_token = login_session.get('access_token')
    stored_gplus_id = login_session.get('gplus_id')
    if stored_access_token is not None and gplus_id == stored_gplus_id:
        response = make_response(json.dumps(
                    'Current user is already connected.'), 200)
        response.headers['Content-Type'] = 'application/json'
        return response

    # Store the access token in the session for later use.
    login_session['access_token'] = credentials.access_token
    login_session['gplus_id'] = gplus_id

    # Get user info
    userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
    params = {'access_token': credentials.access_token, 'alt': 'json'}
    answer = requests.get(userinfo_url, params=params)

    data = answer.json()

    login_session['username'] = data['name']
    login_session['email'] = data['email']
    login_session['picture'] = data['picture']

    # See if a user exists, if it doesn't make a new one
    user_id = getUserID(login_session['email'])
    if not user_id:
        user_id = createUser(login_session)
    login_session['user_id'] = user_id

    output = ''
    output += '<h1>Welcome, '
    output += login_session['username']
    output += '!</h1>'
    output += '<img src="'
    output += login_session['picture']
    output += ''' " style = "width: 300px;
                             height: 300px;
                             border-radius: 150px;
                             -webkit-border-radius: 150px;
                             -moz-border-radius: 150px;"> '''
    return output


# User Helper Functions
def createUser(login_session):
    newUser = User(
        name=login_session['username'],
        email=login_session['email'],
        picture=login_session['picture'])
    session.add(newUser)
    session.commit()
    user = session.query(User).filter_by(email=login_session['email']).one()
    return user.id


def getUserInfo(user_id):
    user = session.query(User).filter_by(id=user_id).one()
    return user


def getUserID(email):
    try:
        user = session.query(User).filter_by(email=email).one()
        return user.id
    except:
        return None


# DISCONNECT - Revoke a current user's token and reset their login_session
@app.route('/gdisconnect')
def gdisconnect():
    # Only disconnect a connected user.
    access_token = login_session.get('access_token')
    print access_token
    if access_token is None:
        return redirect(url_for('showCategories'))
    url = 'https://accounts.google.com/o/oauth2/revoke?token=%s' % access_token
    h = httplib2.Http()
    result = h.request(url, 'GET')[0]

    if result['status'] == '200':
        # Reset the user's sesson.
        del login_session['access_token']
        del login_session['gplus_id']
        del login_session['username']
        del login_session['email']
        del login_session['picture']

        return redirect(url_for('showCategories'))
    else:
        # For whatever reason, the given token was invalid.
        response = make_response(
            json.dumps('Failed to revoke token for given user.', 400))
        response.headers['Content-Type'] = 'application/json'
        return response


# Show all categories
@app.route('/')
@app.route('/v1/categories/')
def showCategories():
    categories = session.query(Category).order_by(asc(Category.name))
    if 'username' not in login_session:
        return render_template('publiccategories.html', categories=categories)
    else:
        return render_template('categories.html', categories=categories)


# Show latest items in db
@app.route('/v1/latestitems/')
def showLatestItems():
    items = session.query(Item).order_by(desc(Item.id)).limit(5).all()
    if 'username' not in login_session:
        return render_template('publiclatestitems.html', items=items)
    else:
        return render_template('latestitems.html', items=items)


# Create a new category
@app.route('/v1/categories/new/', methods=['GET', 'POST'])
def newCategory():
    if 'username' not in login_session:
        return redirect('/v1/login')
    if request.method == 'POST':
        newCategory = Category(
            name=request.form['name'], user_id=login_session['user_id'])
        session.add(newCategory)
        session.commit()
        return redirect(url_for('showCategories'))
    else:
        return render_template('newcategory.html')


# Edit a category
@app.route('/v1/categories/<int:category_id>/edit/', methods=['GET', 'POST'])
def editCategory(category_id):
    if 'username' not in login_session:
        return redirect('/v1/login')
    editedCategory = session.query(
        Category).filter_by(id=category_id).one()
    if editedCategory.user_id != login_session['user_id']:
        return """
                <script>function myFunction(){
                alert('You are not authorized to edit this category.'
                + 'Please create your own category to edit.');
                window.location.replace("/v1/categories")
                }</script><body onload='myFunction()'>
                """
    if request.method == 'POST':
        if request.form['name']:
            editedCategory.name = request.form['name']
            return redirect(url_for('showCategories'))
    else:
        return render_template('editcategory.html', category=editedCategory)


# Delete a category
@app.route('/v1/categories/<int:category_id>/delete/', methods=['GET', 'POST'])
def deleteCategory(category_id):
    if 'username' not in login_session:
        return redirect('/v1/login')
    categoryToDelete = session.query(
        Category).filter_by(id=category_id).one()
    itemsToDelete = session.query(Item).filter_by(
                        category_id=categoryToDelete.id).all()
    if categoryToDelete.user_id != login_session['user_id']:
        return """
                <script>function myFunction()
                {
                    alert('You are not authorized to delete this category.'
                    + 'Please create your own category to delete.');
                    window.location.replace("/v1/categories")
                }</script><body onload='myFunction()''>''
                """
    if request.method == 'POST':
        session.delete(categoryToDelete)
        for item in itemsToDelete:
            session.delete(item)
        session.commit()
        return redirect(url_for('showCategories'))
    else:
        return render_template(
                'deletecategory.html', category=categoryToDelete)


# Show items of a category
@app.route('/v1/categories/<int:category_id>/')
@app.route('/v1/categories/<int:category_id>/items/')
def showItems(category_id):
    category = session.query(Category).filter_by(id=category_id).one()
    items = session.query(Item).filter_by(
        category_id=category_id).all()
    if 'username' not in login_session:
        return render_template(
                'publicitems.html', items=items, category=category)
    else:
        return render_template(
                'items.html', items=items, category=category)


# Show an item
@app.route('/v1/categories/<int:category_id>/items/<int:item_id>')
def showItemDetails(category_id, item_id):
    category = session.query(Category).filter_by(id=category_id).one()
    item = session.query(Item).filter_by(id=item_id).one()
    creator = getUserInfo(item.user_id)
    if ('username' not in login_session or
            creator.id != login_session['user_id']):
        return render_template(
                'publicitemdetails.html',
                item=item, category=category, creator=creator)
    else:
        return render_template(
                'itemdetails.html',
                item=item, category=category, creator=creator)


# Create a new item
@app.route(
        '/v1/categories/<int:category_id>/items/new/',
        methods=['GET', 'POST'])
def newItem(category_id):
    if 'username' not in login_session:
        return redirect('/v1/login')
    if request.method == 'POST':
        newItem = Item(name=request.form['name'],
                       description=request.form['description'],
                       capacity=request.form['capacity'],
                       fuelType=request.form['fuelType'],
                       mileage=request.form['mileage'],
                       maxSpeed=request.form['maxSpeed'],
                       price=request.form['price'],
                       category_id=category_id,
                       user_id=login_session['user_id'])
        session.add(newItem)
        session.commit()
        return redirect(url_for('showItems', category_id=category_id))
    else:
        return render_template('newitem.html', category_id=category_id)


# Edit an item
@app.route(
            '/v1/categories/<int:category_id>/items/<int:item_id>/edit',
            methods=['GET', 'POST'])
def editItem(category_id, item_id):
    if 'username' not in login_session:
        return redirect('/v1/login')
    editedItem = session.query(Item).filter_by(id=item_id).one()

    if editedItem.user_id != login_session['user_id']:
        return """
                <script>
                    function myFunction()
                    {
                        alert('You are not authorized to edit this item.'
                        + 'Please create your own item to edit.');
                        window.location.replace("/v1/categories");
                    }</script><body onload='myFunction()'>
                """

    if request.method == 'POST':
        if request.form['name']:
            editedItem.name = request.form['name']
        if request.form['description']:
            editedItem.capacity = request.form['description']
        if request.form['capacity']:
            editedItem.mileage = request.form['capacity']
        if request.form['fuelType']:
            editedItem.description = request.form['fuelType']
        if request.form['mileage']:
            editedItem.description = request.form['mileage']
        if request.form['maxSpeed']:
            editedItem.description = request.form['maxSpeed']
        if request.form['price']:
            editedItem.price = request.form['price']

        session.add(editedItem)
        session.commit()
        return redirect(url_for('showItems', category_id=category_id))
    else:
        return render_template(
                'edititem.html',
                category_id=category_id, item_id=item_id, item=editedItem)


# Delete an item
@app.route(
            '/v1/categories/<int:category_id>/items/<int:item_id>/delete',
            methods=['GET', 'POST'])
def deleteItem(category_id, item_id):
    if 'username' not in login_session:
        return redirect('/v1/login')
    itemToDelete = session.query(Item).filter_by(id=item_id).one()
    if itemToDelete.user_id != login_session['user_id']:
        return """
                <script>
                    function myFunction()
                    {
                        alert('You are not authorized to delete this item.'
                        + 'Please create your own item to delete.');
                        window.location.replace("/v1/categories");
                    }</script><body onload='myFunction()'>
                """
    if request.method == 'POST':
        session.delete(itemToDelete)
        session.commit()
        itemsRemaining = session.query(Item).filter_by(
                            category_id=category_id).count()
        if itemsRemaining == 0:
            return redirect(url_for('showCategories'))
        else:
            return redirect(url_for('showItems', category_id=category_id))
    else:
        return render_template(
                'deleteitem.html',
                item=itemToDelete, category_id=category_id)


# JSON APIto view Categories
@app.route('/api/v1/categories/JSON')
def categoriesJSON():
    categories = session.query(Category).all()
    return jsonify(categories=[c.serialize for c in categories])


# JSON API to view Items given a Category
@app.route('/api/v1/categories/<int:category_id>/items/JSON')
def categoryItemsJSON(category_id):
    items = session.query(Item).filter_by(
        category_id=category_id).all()
    return jsonify(items=[i.serialize for i in items])


# JSON API to view Items given a Category
@app.route('/api/v1/categories/<int:category_id>/items/<int:item_id>/JSON')
def itemJSON(category_id, item_id):
    item = session.query(Item).filter_by(id=item_id).one()
    return jsonify(item=item.serialize)


if __name__ == '__main__':
    app.debug = False
    app.run()
