const mapApiDungeonToPeriodDungeon = ({
    id,
    name,
    map,
    zone,
    dungeon,
    keystone_upgrades,
    is_tracked: tracked
}) => ({
    id,
    name,
    map: map.id,
    zone: zone.slug,
    dungeon: dungeon.id,
    upgrades: keystone_upgrades.map(({ qualifying_duration }) => qualifying_duration),
    tracked
});

const mapApiAffixToAffix = ({ id, name }) => ({ id, name });

const mapApiPeriodToPeriodWithoutDungeons = ({ id, start_timestamp, end_timestamp }) =>
    ({ id, start_timestamp, end_timestamp});

module.exports = {
    mapApiDungeonToPeriodDungeon,
    mapApiAffixToAffix,
    mapApiPeriodToPeriodWithoutDungeons
};
