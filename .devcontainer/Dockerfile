# ベースイメージ: OpenFisca(バックエンド)が要求する Python 3.11
FROM python:3.11-bookworm

# 開発に使う OS パッケージ（git / エディタ / JSON整形 / 日本語コード変換 nkf / tmux 等）
RUN apt update && apt install -y \
    git \
    curl \
    vim \
    htop \
    jq \
    nkf \
    tmux \
    ncurses-term \
    locales

# devcontainer.json の LANG/LC_CTYPE(ja_JP.UTF-8)に対応するロケールを生成
RUN sed -i 's/^# *ja_JP.UTF-8 UTF-8/ja_JP.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen ja_JP.UTF-8 \
    && update-locale LANG=ja_JP.UTF-8

# Docker CLI をインストール（ホストの docker.sock 経由で使う: docker-from-docker）
RUN curl -fsSL https://get.docker.com | sh

# Python のフォーマッタ / リンタをインストール
RUN pip install --no-cache-dir --upgrade pip setuptools \
    && pip install --no-cache-dir autopep8 flake8

# リポジトリを /app にコピーしてバックエンドをセットアップ
WORKDIR /app
COPY . /app

# 依存インストール + ビルド（テストが動く状態にする）
RUN make install && make build

# フロントエンド(30000) / バックエンドAPI(50000) のポート
EXPOSE 30000
EXPOSE 50000

# 非 root の作業ユーザー user を作成（devcontainer.json の remoteUser=user に対応）
RUN useradd -m -s /bin/bash user

# Backspace キーは端末によって BS(^H) を送るものと DEL(^?) を送るものがある。
# tty の erase 文字に依存せず両方効くよう、readline(bash 等)で双方を
# backward-delete-char にバインドしておく。
RUN printf '%s\n' \
    'set bind-tty-special-chars off' \
    '"\C-h": backward-delete-char' \
    '"\C-?": backward-delete-char' \
    >> /etc/inputrc

# ENTRYPOINT 用スクリプトを生成する。
# ホストの docker.sock の GID に合わせてグループを作成し user を追加することで、
# 非 root ユーザーでも docker コマンドが使えるようにしてから、本来のコマンドを exec する。
ARG NONROOT_USER=user
RUN echo "#!/bin/sh\n\
    sudoIf() { if [ \"\$(id -u)\" -ne 0 ]; then sudo \"\$@\"; else \"\$@\"; fi }\n\
    SOCKET_GID=\$(stat -c '%g' /var/run/docker.sock) \n\
    if [ \"${SOCKET_GID}\" != '0' ]; then\n\
    if [ \"\$(cat /etc/group | grep :\${SOCKET_GID}:)\" = '' ]; then sudoIf groupadd --gid \${SOCKET_GID} docker-host; fi \n\
    if [ \"\$(id ${NONROOT_USER} | grep -E \"groups=.*(=|,)\${SOCKET_GID}\(\")\" = '' ]; then sudoIf usermod -aG \${SOCKET_GID} ${NONROOT_USER}; fi\n\
    fi\n\
    exec \"\$@\"" > /usr/local/share/docker-init.sh \
    && chmod +x /usr/local/share/docker-init.sh

ENTRYPOINT [ "/usr/local/share/docker-init.sh" ]
# コンテナを常駐させる（中でプロセスを起動しなくても終了しないようにする）
CMD [ "sleep", "infinity" ]
