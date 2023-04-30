FROM node:18-bullseye
RUN useradd -m user
USER user

WORKDIR /app
COPY . /app
RUN npm ci

EXPOSE 30000

CMD ["npm", "run", "dev"]
