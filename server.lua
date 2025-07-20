local QBCore = exports['qb-core']:GetCoreObject()

-- makes sure the tablet the ui loads when the tablet is used
QBCore.Functions.CreateUseableItem('gang_tablet', function(source, item)
    local Player = QBCore.Functions.GetPlayer(source)
    if Player.PlayerData.gang and Player.PlayerData.gang.name ~= "none" then
        TriggerClientEvent('gangTablet:client:ToggleUI', source)  -- fire a client event
    else
        TriggerClientEvent('QBCore:Notify', source,
            "You must be in a gang to use the tablet.", "error")
    end
end)



