# s24_team_1

Repository for s24_team_1

The config.ini in the repo is just for testing purposes. 

Run the following command to create a new virtual env and install the dependencies.

```
python3 -m venv venv .
source /venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

Then run

```
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
