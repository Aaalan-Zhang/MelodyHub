# s24_team_1

Repository for s24_team_1

Best Project of S24 for CMU Web Application Development. But, overall, just a normal idea without any interesting ideas. For an more interesting one, I encourage you 

You will need to create a config.ini file in the `./melodyhub` directory, the format is

```
[Django]
Secret: <generate a random secret>


# Generate the GoogleOAuth2 key (client_id) and secret at https://console.cloud.google.com
# You will need to search for OAuth and go to the "Credentials" section
# For the redirecting URL, if you are doing local testing, put 
# http://127.0.0.1:8000/complete/google-oauth2/
# http://localhost:8000/complete/google-oauth2/

[GoogleOAuth2]
client_id: <your OAuth client id>
client_secret: <your OAuth secret>

[musicplay]
title=MelodyHub Main Page
users=@andrew.cmu.edu
```

Then, run the following command to create a new virtual env and install the dependencies.

```
python3 -m venv venv
source ./venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

You will also need to make sure the redis service is running on port 6379. An easy way to check is simply running 

```
redis-cli -p 6379 ping
```

in your terminal, and if redis is running on port 6379, you will see

```
PONG
```

If not, an easy way to quickly install and run is to use docker:

```
docker pull redis
docker run -d --name my-redis -p 6379:6379 redis
```

Then, run

```
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

And you are good to go.

Citation: The basic ideas of the WebSocket implementation of the ListenTogether room was inspired by the WebSocket codes provided in the course and by a project on GitHub called synphony (https://github.com/alan9262/synphonymusicweb). However, we got the idea of the ListenTogether Room by ourselves. The functionalities are very different and we also wrote substantially different codes.
