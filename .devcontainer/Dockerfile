FROM python:3.11-bookworm

RUN apt update && apt install -y \
    git \
    curl \
    vim \
    htop \
    jq \
    nkf \
    tmux \
    ncurses-term

RUN curl -fsSL https://get.docker.com | sh

RUN curl -Ls https://deb.nodesource.com/setup_18.x | bash
RUN apt update && apt install -y nodejs

RUN pip install --upgrade pip
RUN pip install --upgrade setuptools
RUN pip install --no-cache-dir \
    autopep8 \
    flake8

WORKDIR /app
COPY . /app

RUN make install
RUN make build

EXPOSE 30000
EXPOSE 50000

RUN useradd -m -s /bin/bash user

# Some host terminals send BS (^H) for the Backspace key while others send DEL (^?).
# Bind both to backward-delete-char so readline sessions (bash, etc.) work either way,
# instead of relying on the negotiated tty erase character.
RUN printf '%s\n' \
    'set bind-tty-special-chars off' \
    '"\C-h": backward-delete-char' \
    '"\C-?": backward-delete-char' \
    >> /etc/inputrc

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
CMD [ "sleep", "infinity" ]
