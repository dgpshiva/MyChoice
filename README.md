# MyChoice

This repository contains code for an anonymous poll taking web application. I had built the application for our workplace so that it can be used by HR to gather sentiment of employees one some topics. And also by development teams to gather votes during development phase on what features should be added to a product and how they should look.

## Table of contents
- [Tech Stack](#tech-stack)
- [Requirements to run the code](#requirements-to-run-the-code)
- [Supported browser](#supported-browser)
- [Running the code](#running-the-code)
- [Navigating the application](#navigating-the-application)
- [Stopping the code](#stopping-the-code)
- [Link to version deployed on Heroku](#link-to-version-deployed-on-heroku)
- [Extending the application](#extending-the-application)
- [References](#references)

## Tech stack
Tech stack used to build this application is as follows:
- Knockout JS 3.2.0
- JQuery
- Python 2.7 (Flask)
- Postgres SQL

## Requirements to run the code
- Python (version 2.7 or higher is preferred)
- The following python libraries need to be installed if not already present: flask, requests, sqlalchemy
- Postgres SQL

## Supported browser
- Google Chrome is the officially supported browser for this app
- Some ui elements might not be supported on other browsers

## Running the code
### Setting up Postgres SQL
- Create new login on Postgres with CREATE DATABASE access
- Use the login to create a new database named _mychoice_
- Use the credentials for this login for the connection strings in the code

### Version without user authentication
- Pull the code from branch [release-v1](https://github.com/dgpshiva/MyChoice/releases/tag/v1.0) of this repository
- Update the connection string in the python code [database_setup.py](./database_setup.py) with credentials for login created above
- Run the python code [database_setup.py](./database_setup.py) using the command `python database_setup.py`
- This should create the required tables on Postgres SQL
- Update the connection string in the python code [__init__.py](./__init__.py) with credentials for login created above
- Run the python code [__init.py__](./__init__.py) using the command `python __init__.py`
- Leave the terminal/command prompt window open
- Open Google Chrome and navigate to 'localhost:5000'
- This should open up the web application

### Version with LDAP user authentication
- Pull the code from branch [release-v2](https://github.com/dgpshiva/MyChoice/releases/tag/v2.0) of this repository
- Update the connection string in the python code [database_setup.py](./database_setup.py) with credentials for login created above
- Run the python code [database_setup.py](./database_setup.py) using the command `python database_setup.py`
- This should create the required tables on Postgres SQL
- Update the connection string in the python code [__init__.py](./__init__.py) with credentials for login created above
- Update LDAP server name and Base domain with entries for your organization in the [__init__.py](./__init__.py)
- Run the python code [__init.py__](./__init__.py) using the command `python __init__.py`
- Leave the terminal/command prompt window open
- Open Google Chrome and navigate to 'localhost:5000'
- This should open up the web application

## Navigating the application
- Login page is displayed to the user on the landing page
- In version without user auth, after user enters his name and clicks login, the user name is stored for the session
- In version with LDAP auth, after user enters his credentials and clicks login, the credentials are used to validate the user and if validation passes the username is stored for the session
- If user auth fails, _Failed to login_ error message is displayed to user
- On login the list of questions posted in the app is displayed to the user
- Clicking on a question displays the choices and current vote count
- User can cast their vote by clicking on a choice
- There is an animated bubble for each choice which increases in size based on the number of votes that have been cast for that choice
- Users can post their own question using the _Post Question_ button
- The delete trash icon against a question is only visible to the user if he/she is owner of that question. A question can be deleted only by owner of the question
- Clicking on _Logout_ button logs user out of the application
- Users are also automatically logged off if they are inactive for more than 20 mins on the application

## Stopping the code
- Close the browser
- Press Ctrl+C on the open terminal/command propmt window
- Close the terminal/command prompt window

## Link to version deployed on Heroku
- Version without user auth has been deployed to Heroku. It can be accessed at: https://my-choice55.herokuapp.com/v1/indexPage

## Extending the application
- The [release-v1](https://github.com/dgpshiva/MyChoice/releases/tag/v1.0) version of the application can be extended to implement any sort of user authentication
- The user authentication code logic need to be added to the [__init__.py](./__init__.py) file

## References
- This app was built using the skills I had aquired with the Udacity Full Stack Web Developer course
