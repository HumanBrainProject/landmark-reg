FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY run-flask.sh .
COPY ./landmark-reg-compiled-backend.tar.gz .
RUN tar -zxf landmark-reg-compiled-backend.tar.gz && rm landmark-reg-compiled-backend.tar.gz

COPY ./frontend frontend
RUN ln -sfn /zoomer-data/ frontend/zoomer-data

CMD [ "./run-flask.sh", "--no-reload", "--host=0.0.0.0", "--port=5000" ]
