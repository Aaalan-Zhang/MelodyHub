# s24_team_1

Repository for s24_team_1

The config.ini in the repo is just for testing purposes.

Run the following command to create a new virtual env and install the dependencies.

```
python3 -m venv venv
source ./venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

Then run

```
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Citation: The basic ideas of the WebSocket implementation of the ListenTogether room was inspired by the WebSocket codes provided in the course and by a project on GitHub called synphony (https://github.com/alan9262/synphonymusicweb). However, we got the idea of the ListenTogether Room by ourselves. The functionalities are very different and we also wrote substantially different codes.
