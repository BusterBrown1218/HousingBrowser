/// <reference types="../CTAutocomplete" />
import { request } from "axios";
import { Keybind } from "KeybindFix";
import { browser } from "./browser/gui.js";
import Settings from "./data/Settings.js";

import "./browser/bookmark.js";

new Keybind("Open Browser", Keyboard.KEY_G, "§3HousingBrowser §f- ChatTriggers").registerKeyPress(openBrowser);
register("command", openBrowser).setName("browser");

function openBrowser() {
    try {
        request({
            url: "http://busterbrown1218.xyz:3000",
            method: "GET"
        }).then(response => {
            let houses = response.data;
            
            browser.open(houses);
        });
    } catch (e) {
        console.error(e);
        ChatLib.chat(`&3[HousingBrowser] &cSomething went wrong ...`);
    }
}

register("command", Settings.openGUI).setName("housingbrowser").setAliases(["hb"]);