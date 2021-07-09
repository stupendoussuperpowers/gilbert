# gilbert

![npm](https://img.shields.io/npm/v/gilbert)

An assistant to help with managing microservices compatible with Google App Engine configurations, in dev.

## Motivation

Google App Engine, and in general serverless microservice management being on the rise, it's not always very easy to replicate the same environments in development.

Gilbert is designed to read `app.yaml` & `dispatch.yaml` using the App Engine configuration, to run `nodejs` services, and dispatch the routes to these.

## How to Run

### Installation

`npm i gilbert`

### Running in Dev

`gilbert run dev [--configFilePath; default=config.yaml] [--port; default=5050]`

## Current Features

- Process `package.json` scripts for nodejs runtimes
- Combatible with dispatch and app configuration yamls based on GAE specifications. Just set the Dev Proxy to `localhost:[port]`.
- Isolated Logs and Processes for each service

## To-Do

- Migrating to Containers from the currently running 'notainers'
- Migrating Process Management binaries to GoLang
- Providing shell for each service
- File-watching
- Local Databases and FileSystems
- Possible Production ready mode with containerd and nginx(?)
