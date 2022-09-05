const { describe, expect, test } = require('@jest/globals');

const {
    mapApiDungeonToPeriodDungeon,
    mapApiAffixToAffix,
    mapApiPeriodToPeriodWithoutDungeons
} = require('../mythic-enum-snapshot');

const ArrayOfPeriods = require('./__fixtures__/array-of-periods.json');
const AffixIndex = require('./__fixtures__/affix-index.json');
const ArrayOfDungeons = require('./__fixtures__/array-of-dungeons.json');

describe('transformers', () => {
    test('mapApiDungeonToPeriodDungeon', () => {
        const actual = ArrayOfDungeons.map(mapApiDungeonToPeriodDungeon);
        expect(actual).toMatchSnapshot();
    });

    test('mapApiAffixToAffix', () => {
        const result = AffixIndex.map(mapApiAffixToAffix);
        expect(result).toMatchSnapshot();
    });

    test('mapApiPeriodToPeriodWithoutDungeons', () => {
        const result = ArrayOfPeriods.map(mapApiPeriodToPeriodWithoutDungeons);
        expect(result).toMatchSnapshot();
    });
});