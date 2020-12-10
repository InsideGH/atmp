FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install --only=prod

COPY . .

# DEV MODE
CMD ["npm", "run", "dev"]

# PROD MODE
# RUN npm run build
# CMD ["npm", "start"]