# lmda-mythic-enum-scanner
Obtains snapshots, harvests unique entities, and generates entity events for: Mythic affixes, dungeons, and periods

### Working With This
- Clone, `npm i`
- `npm run local` to fire the lambda method locally
- `npm run test` to run through jest tests written
- Deploys to lambda on commit push to `main` branch on github

### What to Have
- Blizzard API Developer Account and API Key+Secret
- AWS Account, Access to create Lambda Functions
- Github Account to deploy and use Github Actions
- Mongo database, write access connection string

### What Happens?
- Connects to Blizzard API and retrieves affix and dungeon lists
- Retrieves unique affixes and dungeons
- Upserts unique entities to BlizzData tables
- Retrieves info for current period
    - Nests current dungeon goals within current period
- Upsert current period to BlizzData table
- Monitor newly created (first seen) affixes, dungeons, and periods to add BlizzEntityEvents


`MythicEnumSnapshot`:
```js
{ _id, stamp, type, data: { created, affixes: [`Affix`], period: { id, start_timestamp, end_timestamp, dungeons: [`Period Dungeon`] } }}
```

`Affix`:
```js
{ id, name }
```


`Period Dungeon`:
```js
{ id, name, map, zone, dungeon, upgrades: [1, 2, 3] }
```

### Resource Usage
Lambda Function Using:
- 128MB Memory (~100MB used)
- Billable Duration over snapshot: ~4260ms

### Plugging into the Cloud
- Deploy to github to leverage GitHub Actions written in .github\workflows
- Add projects secrets to github repo `AWS_ACCESS_KEY_ID`, `DISCORD_NOTIFICATION_WEBHOOK`, and `AWS_SECRET_ACCESS_KEY`
- Will need to have a named lambda function already created by the name in deploy yml. `lmda-mythic-enum-scanner` here
- Pre-made lambda is going to need environment variables on board, also make local uncommitted .env with those same values. It'll make sure local runs work
- Create Event Rule in Amazon EventBridge to kick off the named lambda every day

        Much of this will be in a Terraform file so it doesn't need to be done manually
- Pre-made lambda timeout increased to like 15 seconds

### @dungeoneer-io/nodejs-utils
See [@dungeoneer-io/nodejs-utils](https://github.com/dungeoneer-io/nodejs-utils) for hints on how to configure environment variables in dotenv