FROM python:3.8-bullseye
USER root

#RUN pip install --upgrade pip
#RUN pip install --upgrade setuptools
RUN pip install --no-cache-dir \
    autopep8==1.5.7 \
    flake8==3.9.2

WORKDIR /app
COPY . /app

RUN make install
RUN make build

RUN useradd -m user
USER user

EXPOSE 50000

CMD ["bash"]
