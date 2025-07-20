local QBCore = exports['qb-core']:GetCoreObject()
local tabletItemName = "gang_tablet"
local isTabletOpen = false

-- Function to toggle the tablet UI
local function ToggleTabletUI()
    isTabletOpen = not isTabletOpen
    SetNuiFocus(isTabletOpen, isTabletOpen)
    SendNUIMessage({
        action = "toggleUI",
        show   = isTabletOpen
    })
    if isTabletOpen then
        -- requests the latest list of jobs from the server when you open the tablet
        TriggerServerEvent("gangTablet:requestJobs")
    end
end

RegisterNUICallback('getActiveJobs', function(_, cb)
    QBCore.Functions.TriggerCallback('npc_crimes:getActiveJobs', function(j)
        cb(j or {})
    end)
end)

-- Accepts a job from the tablet UI (Still not functional btw)
RegisterNUICallback('acceptJobFromTablet', function(data, cb)
    TriggerServerEvent('npc_crimes:acceptJobFromTablet', data.jobId)
    cb('ok')
end)

RegisterNUICallback('claimReward', function(data, cb)
    TriggerServerEvent('npc_crimes:claimReward', data.amount)
    cb('ok')
end)

-- Register the usable item after QBCore is fully loaded
RegisterNetEvent('gangTablet:client:ToggleUI', function()
    ToggleTabletUI()
end)

-- Handle NUI close callback
RegisterNUICallback("close", function(_, cb)
    ToggleTabletUI()
    cb("ok")
end)

-- (pretty much usesless i just forgot to remove it)
RegisterNUICallback("selectJob", function(data, cb)
    if data and data.jobId then
        TriggerServerEvent("gangTablet:applyJob", data.jobId)
    end
    cb("ok")
end)

-- (also useless these two were from an idea i had but i scratched it, and im over this project alr so ill keep it here)
RegisterNetEvent("gangTablet:sendJobs", function(jobList)
    SendNUIMessage({
        action = "populateJobs",
        jobs   = jobList
    })
end)

-- Allow closing with ESC key
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if isTabletOpen and IsControlJustReleased(0, 322) then -- ESC key
            ToggleTabletUI()
        end
    end
end)