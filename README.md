## Minimum requirements:

```
node v8.9.3, MongoDB v3.4
```

## Install

- install MongoDB
- install node.js

- install pm2 global:

```
npm install pm2 -g
```

- the following values must be set in the PATH environment variable, for Windows:

```
C:\Users\<username>\AppData\Roaming\npm
<path to mongodb>\MongoDB\Server\3.6\bin
```

- install libraries. Once the project is cloned,
execute the following commands from the root directory of the project:

```
npm install
```

## You must then configure the mongo database address:
- all configs are stored in `./config` directory
- examples of how to fill in configs are presented in `local-production.yaml.dist` file into the same directory with name `local-production.yaml`
- fill in new  `local-production.yaml` according to `local-production.yaml.dist` and `default.yaml` structure
- `local-production.yaml` file is **not tracked** by git

## Load default data
> After `local-production.yaml` configured you can load default data. It is possible to either load user data:
```
npm run loadUserFixtures
```
> or all data:
```
npm run loadAllFixtures
```

### **_ATTENTION, previous collections data will be deleted_**

**********

## To start the app as a service, execute the following:

```
pm2 start pm2.config.js --env production
```

## To stop the app service, execute the following:

```
pm2 stop server
```
> or

```
pm2 delete server
```

## To show the status of the web services:

```
pm2 status
```
> or
```
pm2 show server
```
### _For more information on pm2 see [its docs](http://pm2.keymetrics.io/docs/usage/quick-start/)_