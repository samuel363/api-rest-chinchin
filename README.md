# api-rest

## URL:
http://localhost:3700/

## Servicios REST API:

**/api/get-coins-usd**

**/api/get-amount-change**
    parametros:
        amount

<!-- #############################################################3  -->
## Build and Run
```
npm i
npm start
```
## Docker
```
docker build -t api-rest .
docker run -p 3700:3700 -d api-rest
docker start <CONTAINTER_ID>

```

--docker run -it --rm --name running-api-rest api-rest
--docker run -p 49160:8080 -d api-rest/node-web-app

## REVISAR:

npm WARN api-rest@1.0.0 No description
npm WARN api-rest@1.0.0 No repository field.
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@2.1.3 (node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.1.3: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})


Enlazar CRON Con Test2
