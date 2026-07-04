# fix version (only 26 -> 26.xx(latest ver))
FROM node:26.4-bullseye

# comment out useradd for "npm cache clean"
#RUN useradd -m user
#USER user

WORKDIR /app
COPY . /app

# add "npm cache clean" for trouble shooting written in "docs/dev_note.md"
RUN npm cache clean --force && npm ci

EXPOSE 30000

CMD ["npm", "run", "dev"]
