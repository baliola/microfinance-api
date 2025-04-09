ARG NODE_VERSION=22.12.0
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

## Seperate image for runtime
FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 8080

# Start the application
CMD [ "pnpm", "start:prod" ]
