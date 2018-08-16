FROM python:3

###############################
# 1. Install packages as root #
###############################

RUN pip install --no-cache-dir gunicorn

WORKDIR /usr/src/app

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend backend

COPY ./frontend frontend
COPY ./node_modules/@bower_components node_modules/@bower_components

###########################################################
# 2. Create an unprivileged user that will run the server #
###########################################################
RUN groupadd -r landmark_reg && useradd -r -g landmark_reg landmark_reg
USER landmark_reg

EXPOSE 8000
CMD gunicorn --access-logfile=- backend:app --bind=:8000
