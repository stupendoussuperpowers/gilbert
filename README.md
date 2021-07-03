# gilbert

An assistant to help with managing microservices compatible with Google App Engine configurations, in dev.

## motivation

Google App Engine, and in general serverless microservice management being on the rise, it's not always very easy to replicate the same environments in development.

Gilbert is designed to read `app.yaml` & `dispatch.yaml` using the App Engine configuration, to run `nodejs` services, and dispatch the routes to these.

Gilbert also provides logs similar to how `docker-compose` does

## how to run

[Currently unpublished, but the goal is for the module to be a simple CLI]

`gilbert --configFilePath=config.yaml --port=5050`

## future scope

- More runtimes
- Broader scope for configurations
- Serving static files, scaling for production
