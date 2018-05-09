FROM python:3

###############################
# 1. Install packages as root #
###############################

RUN pip install --no-cache-dir gunicorn

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./landmark-reg-backend.tar.gz .
RUN tar -zxf landmark-reg-backend.tar.gz && rm landmark-reg-backend.tar.gz

COPY ./landmark-reg-frontend.tar.gz .
RUN tar -zxf landmark-reg-frontend.tar.gz && rm landmark-reg-frontend.tar.gz
RUN ln -sn /zoomer-data/ frontend/zoomer-data

VOLUME /zoomer-data

###########################################################
# 2. Create an unprivileged user that will run the server #
###########################################################
RUN groupadd -r landmark_reg && useradd -r -g landmark_reg landmark_reg
USER landmark_reg

EXPOSE 8000
CMD gunicorn --access-logfile=- backend:app --bind=:8000
