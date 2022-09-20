const { getDb } = require('@dungeoneer-io/nodejs-utils');
const {
    BEE_TYPES,
    COLLECTIONS,
    DATABASES
} = require('./entity-enums');

const upsertAffixEntitiesFromSnapshot = async (mythicSnapshot) => {
    const affixCollection = await getDb()
        .db(DATABASES.DEFAULT)
        .collection(COLLECTIONS.AFFIXES);
    const batch = affixCollection.initializeUnorderedBulkOp();

    mythicSnapshot.affixes.forEach(({ id, name }) => {
    batch.find({ _id: `${id}` })
        .upsert()
        .updateOne({
            $setOnInsert: {
                first: Date.now(),
                name
            },
            $set: {
                last: Date.now(),
            }
        });
    });
    const results = await batch.execute();

    if (results.result && results.result.nUpserted > 0) {
        const upsertedIds = results.result.upserted.map(({ _id }) => _id);
        await insertBlizzardEntityEventArray(upsertedIds, BEE_TYPES.AFFIX);
    }
};

const upsertDungeonEntitiesFromSnapshot = async (mythicSnapshot) => {
    const dungeonCollection = await getDb()
        .db(DATABASES.DEFAULT)
        .collection(COLLECTIONS.DUNGEONS);
    const batch2 = dungeonCollection.initializeUnorderedBulkOp();

    mythicSnapshot.period.dungeons.forEach(({ id, upgrades, ...rest }) => {
    batch2.find({ _id: `${id}` })
        .upsert()
        .updateOne({
            $setOnInsert: {
                first: Date.now(),
                ...rest
            },
            $set: {
                last: Date.now(),
            }
        });
    });
    const results2 = await batch2.execute();

    if (results2.result && results2.result.nUpserted > 0) {
        const upsertedIds = results2.result.upserted.map(({ _id }) => _id);
        await insertBlizzardEntityEventArray(upsertedIds, BEE_TYPES.DUNGEON);
    }
};

const upsertPeriodEntityFromSnapshot = async (mythicSnapshot) => {
    const periodCollection = await getDb()
        .db(DATABASES.DEFAULT)
        .collection(COLLECTIONS.PERIODS);

    const result3 = await periodCollection.updateOne(
        { _id: `${mythicSnapshot.period.id}`},
        {
            $setOnInsert: {
                first: Date.now(),
                ...mythicSnapshot.period
            },
            $set: {
                last: Date.now()
            }
        },
        { upsert: true }
    );

    if (result3 && result3.upsertedCount) {
        await insertBlizzardEntityEventArray([mythicSnapshot.period.id], BEE_TYPES.PERIOD);
    }
};

const insertBlizzardEntityEventArray = async (idArray, type, event = 'ADDED') => {
    console.log(`transmitting ${idArray.length} identified entity events..`);
    const eventColl = await getDb()
        .db(DATABASES.DEFAULT)
        .collection(COLLECTIONS.BLIZZARDENTITYEVENTS);
    await eventColl.insertMany(
        idArray.map((o) => ({
            stamp: Date.now(),
            entity: {
                id: o,
                type
            },
            event
        }))
    );
};

const sendToDatabase = async (mythicSnapshot) => {
    console.log('transmitting unique affixes...');
    await upsertAffixEntitiesFromSnapshot(mythicSnapshot);
    console.log('transmitting unique dungeons...');
    await upsertDungeonEntitiesFromSnapshot(mythicSnapshot);
    console.log('transmitting unique period...');
    await upsertPeriodEntityFromSnapshot(mythicSnapshot);
};

module.exports = sendToDatabase;

