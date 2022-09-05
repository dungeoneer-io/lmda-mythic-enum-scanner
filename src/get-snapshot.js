const { ObjectId } = require('mongodb');
const {
    getMythicAffix,
    getMythicData,
    queueUntilResolved,
    getDb
} = require('@dungeoneer-io/nodejs-utils');

const {
    mapApiAffixToAffix,
    mapApiDungeonToPeriodDungeon,
    mapApiPeriodToPeriodWithoutDungeons
} = require('./bapi-mapper/mythic-enum-snapshot');
const {
    BAPI_MYTHIC_RESOURCE_TYPES,
    COLLECTIONS,
    DATABASES
} = require('./entity-enums');

const MYTHIC_ENUM_SNAPSHOT_TYPE = 'MythicEnums';

const getSnapshot = async (lambdaEvent) => {
    const { snapshotId } = lambdaEvent;
    let mythicSnapshot;
    if (!snapshotId) {
        mythicSnapshot = await procureLiveMythicEnumSnapshot();
        const snapshotCollection = await getDb()
            .db(DATABASES.DEFAULT)
            .collection(COLLECTIONS.SNAPSHOTS);
        await snapshotCollection.insertOne({
            stamp: Date.now(),
            type: MYTHIC_ENUM_SNAPSHOT_TYPE,
            data: mythicSnapshot
        });
    } else {
        mythicSnapshot = await fetchSnapshotById(snapshotId);
    }

    return mythicSnapshot;
};

const fetchSnapshotById = async (snapshotId) => {
    const snapshotCollection = await getDb()
        .db(DATABASES.DEFAULT)
        .collection(COLLECTIONS.SNAPSHOTS);

    debugLog(`retrieving snapshot id ${ snapshotId }`);
    const snapshot = await snapshotCollection.findOne({ _id: new ObjectId(snapshotId) });

    return snapshot;
};

const procureLiveMythicEnumSnapshot = async () => {
   const affixResults = await getMythicAffix();
   const affixes = affixResults.affixes.map(mapApiAffixToAffix);


    const periodIndex = await getMythicData({ resource: BAPI_MYTHIC_RESOURCE_TYPES.PERIOD });
    const CURRENT_PERIOD = periodIndex.current_period.id;
    const periodData = await getMythicData({ resource: BAPI_MYTHIC_RESOURCE_TYPES.PERIOD, id: CURRENT_PERIOD });

    const thisPeriod = [periodData].map(mapApiPeriodToPeriodWithoutDungeons)[0];
        
    
    const dungeonIndex = await getMythicData({ resource: BAPI_MYTHIC_RESOURCE_TYPES.DUNGEON });
    const dungeonsToProcess = dungeonIndex.dungeons.map(({ id }) => ({ id, resource: BAPI_MYTHIC_RESOURCE_TYPES.DUNGEON }));
    
    let dungeonResults = await queueUntilResolved(
        getMythicData,
        dungeonsToProcess,
        15,
        3,
        { showBar: true, debug: true }
    )
    .catch(o => console.log('uncaught exception deep within QUR'));

    const periodDungeons = dungeonResults.results.map(mapApiDungeonToPeriodDungeon);
    thisPeriod.dungeons = periodDungeons;

    return {
        created: Date.now(),
        affixes,
        period: thisPeriod
    };
};

module.exports = getSnapshot;
