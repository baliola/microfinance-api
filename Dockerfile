ARG NODE_VERSION=22.12.0
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

## Seperate image for runtime
FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 8080

# Start the application
CMD [ "yarn", "start:prod" ]
