const {
    connectToBlizzard,
    initDb,
    lambdaTry200Catch500
} = require('@dungeoneer-io/nodejs-utils');
const getSnapshot = require('./get-snapshot');
const sendToDatabase = require('./send-to-database');

const harvestAndUpsertMythicEnumData = async (lambdaEvent) => {
    await initDb();
    await connectToBlizzard();
    
    const mythicSnapshot = await getSnapshot(lambdaEvent);
    await sendToDatabase(mythicSnapshot);
    
    return mythicSnapshot;
};


exports.handler = async (event = {}, context) => {
    console.log('Dungeoneer.io');
    console.log('lmda-mythic-enum-scanner');
    console.log('================');

    await lambdaTry200Catch500({
        context,
        event,
        notifyOn200: true,
        fn200: harvestAndUpsertMythicEnumData,
        fn500: (e) => console.log('error', e)
    });
};
