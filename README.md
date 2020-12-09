# api-rest

## URL:
http://localhost:3700/

## REST API SERVICES:

**/api/run-service**
**/api/list-files**
**/api/download?date=dd-mm-yyyy**

## Local Build and Run
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
## Docker-Compose
```
docker-compose  -f docker-compose.yml up -d
```

### Utils:
#### Bash:
```
docker exec -it api-rest bash
```
#### Logs:
```
docker logs -f --tail 10 api-rest
```
