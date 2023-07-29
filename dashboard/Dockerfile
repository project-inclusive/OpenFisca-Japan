# fix version (only 18 -> 18.xx(latest ver))
FROM node:18.16-bullseye

# comment out useradd for "npm cache clean"
#RUN useradd -m user
#USER user

WORKDIR /app
COPY . /app

# add "npm cache clean" for trouble shooting written in "docs/dev_note.md"
RUN npm cache clean --force && npm ci

EXPOSE 30000

CMD ["npm", "run", "dev"]
