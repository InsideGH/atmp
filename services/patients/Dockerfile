FROM node:alpine

ENV NODE_ENV=development

WORKDIR /app
COPY package.json .
RUN npm install --only=prod

COPY . .

CMD ["npm", "start"]