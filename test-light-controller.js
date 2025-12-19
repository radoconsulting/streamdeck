import { exec } from 'child_process';

const url = 'http://test:streamdeck@192.168.0.99:80/data/LoxAPP3.json';
const curlCommand = `curl -s "${url}"`;

exec(curlCommand, (error, stdout) => {
    if (error) {
        console.error('Error:', error);
        return;
    }

    try {
        const data = JSON.parse(stdout);
        const controlUuid = '11a9d968-034d-d138-ffff5a1f13e41874';
        const control = data.controls[controlUuid];

        console.log('Control type:', control.type);
        console.log('Control name:', control.name);
        console.log('\nControl states object:');
        console.log(JSON.stringify(control.states, null, 2));

        const activeMoodsUuid = control.states.activeMoods;
        const moodListUuid = control.states.moodList;

        console.log('\nactiveMoods UUID:', activeMoodsUuid);
        console.log('moodList UUID:', moodListUuid);

        console.log('\ndata.globalStates exists:', !!data.globalStates);
        console.log('data.globalStates type:', typeof data.globalStates);

        const activeMoodsValue = data.globalStates?.[activeMoodsUuid];
        const moodListValue = data.globalStates?.[moodListUuid];

        console.log('\nactiveMoods value from globalStates:', activeMoodsValue);
        console.log('moodList value from globalStates:', moodListValue);

        // Parse mood list
        if (moodListValue) {
            const moodParts = String(moodListValue).split(',');
            const moods = {};
            for (let i = 0; i < moodParts.length; i += 2) {
                if (i + 1 < moodParts.length) {
                    moods[moodParts[i]] = moodParts[i + 1];
                }
            }
            console.log('\nParsed moods:', moods);

            if (activeMoodsValue) {
                const activeMoodIds = String(activeMoodsValue).split(',').filter(id => id.trim());
                const activeMoodNames = activeMoodIds.map(id => moods[id.trim()] || `Mood ${id.trim()}`);
                console.log('\nActive mood IDs:', activeMoodIds);
                console.log('Active mood names:', activeMoodNames);
                console.log('\nDisplay text:', activeMoodNames.length > 0 ? activeMoodNames.join(', ') : 'Off');
            }
        }
    } catch (e) {
        console.error('Parse error:', e);
    }
});
