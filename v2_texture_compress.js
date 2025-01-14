let fs = require('fs')
let args = process.argv.splice(2);
let path_settings = args[0]

eval(`require(\'${path_settings}\')`)
if (global._CCSettings) {
    let data = JSON.stringify(global._CCSettings)
    fs.writeFileSync('tmp_settings.json', data, (err) => {
        console.log('err', err)
    });
}