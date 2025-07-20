

fx_version 'cerulean'
game 'gta5'

author '.akk_'
description 'Gang Tablet UI'
version '1.0.0'

-- Ensure QB-Core and qb-inventory are loaded first because they are needed ofc
dependencies {
    'qb-core',
    'qb-inventory'
}


client_scripts {
    'client.lua',
}
server_script 'server.lua'

-- NUI stuff
ui_page 'html/index.html'
files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/img/tablet-frame.png',
    'html/img/bg-gang.png',
    'html/img/ic-briefcase.png',
    'html/img/ic-grid.png',
    'html/img/ic-cog.png'
}