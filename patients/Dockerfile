FROM node:alpine

ENV NODE_ENV=development

WORKDIR /app
COPY package.json .
RUN npm install --only=prod

# ensures that the files are owned by the unprivileged node user 
# rather than root, which is the default
COPY . .

CMD ["npm", "start"]