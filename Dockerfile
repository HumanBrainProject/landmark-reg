FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY run-flask.sh .
COPY ./backend backend
COPY ./frontend frontend

CMD [ "./run-flask.sh", "--no-reload", "--host=0.0.0.0", "--port=5000" ]
