# docker-compose の openfisca サービス（開発用）で使うイメージ。
# 本番/Cloud Run 向けのイメージは Dockerfile_cloud を参照。
FROM python:3.11-bullseye
USER root

# comment out upgrade pip for avoiding error
#RUN pip install --upgrade pip
#RUN pip install --upgrade setuptools
RUN pip install --no-cache-dir \
    autopep8==1.5.7 \
    flake8==3.9.2

WORKDIR /app
COPY . /app

# 開発用イメージなので editable install（make install）だけを行い、make build は実行しない。
# make build は wheel を作って --force-reinstall するため、editable install が
# 「ビルド時点のコードのコピー」で上書きされてしまう。そうなると /app に bind mount した
# ホスト側のソースを編集しても import 先が変わらず、ホットリロードが一切効かなくなる。
# 「配布物と同じ wheel に対してテストする」ビルドは CI と Dockerfile_cloud が担当する。
RUN make install

RUN useradd -m user
USER user

EXPOSE 50000

CMD ["bash"]
