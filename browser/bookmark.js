/// <reference types="../../CTAutocomplete" />
import { request } from "axios";
import Settings from "../data/Settings";

let bookmarking = false;
let bookmarks;
if (FileLib.exists("HousingBrowser", "/data/bookmarks.json")) bookmarks = JSON.parse(FileLib.read("HousingBrowser", "/data/bookmarks.json"));
else bookmarks = [];

// Add bookmark code
register("command", (...args) => {
    if (bookmarking || unbookmarking || nameCheck) return ChatLib.chat(`&3[HousingBrowser] &cPlease wait...`);
    if (args) return removeBookmark(args); // /bookmark remove
    if (!TabList.getFooter()) return ChatLib.chat(`&3[HousingBrowser] &cYou must be in a housing to do this!`);
    if (TabList.getFooter().split("\n").length < 4) return ChatLib.chat(`&3[HousingBrowser] &cYou must be in a housing to do this!`);
    let match = TabList.getFooter().split("\n")[1].match(/^§r§r§fYou are in §r(.*)§r§f, by §r§7(.*)§r/);
    if (match) {
        ChatLib.command("map");
        bookmarking = true;
        ChatLib.chat("&3[HousingBrowser] &fBookmarking...");
        setTimeout(() => {
            if (bookmarking) {
                bookmarking = false;
                ChatLib.chat(`&3[HousingBrowser] &cSomething went wrong while adding bookmark.`);
            }
        }, 2000);
    } else {
        ChatLib.chat(`&3[HousingBrowser] &cYou must be in a housing to do this!`);
    }
}).setName("bookmark");

register("chat", (event) => {
    if (!bookmarking) return;
    let [_match, huid, name] = ChatLib.getChatMessage(event).match(/§aYou are currently playing on §e(.*) \((.*)\)/);
    event.setCanceled(true);
    huid = huid.replaceAll("-", "");
    bookmarking = false;
    if (bookmarks.some(n => n.huid == huid)) return ChatLib.chat(`&3[HousingBrowser] &cYou bookmarked this house already!`);
    let owner = ChatLib.removeFormatting(TabList.getFooter().split("\n")[1].match(/^§r§r§fYou are in §r(?:.*)§r§f, by §r§7(.*)§r/)[1]);
    if (owner.includes(" ")) owner = owner.split(" ")[1];
    request({
        url: `https://api.mojang.com/users/profiles/minecraft/${owner}`,
        method: "GET"
    }).then(response => {
        if (response.data.errorMessage) return ChatLib.chat(`&3[HousingBrowser] &cCouldn't find the owner's uuid, try again later.`);
        bookmarks.push({ huid: huid, name: name, owner: response.data.id });
        FileLib.write("HousingBrowser", "/data/bookmarks.json", JSON.stringify(bookmarks));
        ChatLib.chat(`&3[HousingBrowser] &fSuccessfully added bookmark! Use /unbookmark or /bookmark remove <housename> to remove bookmark.`);
    });
}).setCriteria(/You are currently playing on (?:.*) (?:.*)/);



// Remove bookmark code
let unbookmarking = false;

register("command", () => {
    if (bookmarking || unbookmarking || nameCheck) return ChatLib.chat(`&3[HousingBrowser] &cPlease wait...`);
    if (!TabList.getFooter()) return ChatLib.chat(`&3[HousingBrowser] &cYou must be in a housing to do this!`);
    if (TabList.getFooter().split("\n").length < 4) return ChatLib.chat(`&3[HousingBrowser] &cYou must be in a housing to do this!`);
    let match = TabList.getFooter().split("\n")[1].match(/^§r§r§fYou are in §r(.*)§r§f, by §r§7(.*)§r/);
    if (match) {
        ChatLib.command("map");
        unbookmarking = true;
        ChatLib.chat("&3[HousingBrowser] &fUnbookmarking...");
        setTimeout(() => {
            if (unbookmarking) {
                unbookmarking = false;
                ChatLib.chat(`&3[HousingBrowser] &cSomething went wrong while removing bookmark.`);
            }
        }, 2000);
    } else {
        ChatLib.chat(`&3[HousingBrowser] &cYou must be in a housing to do this!`);
    }
}).setName("unbookmark");

register("chat", (event) => {
    if (!unbookmarking) return;
    let [_match, huid] = ChatLib.getChatMessage(event).match(/§aYou are currently playing on §e(.*) \((?:.*)\)/);
    event.setCanceled(true);
    huid = huid.replaceAll("-", "");
    unbookmarking = false;
    if (!bookmarks.some(n => n.huid == huid)) return ChatLib.chat(`&3[HousingBrowser] &cYou don't have this house bookmarked!`);
    
    bookmarks = bookmarks.filter(n => n.huid !== huid);
    FileLib.write("HousingBrowser", "/data/bookmarks.json", JSON.stringify(bookmarks), true);
    ChatLib.chat(`&3[HousingBrowser] &fSuccessfully removed bookmark!`);
}).setCriteria(/You are currently playing on (?:.*) (?:.*)/);




// Update bookmark name code
let nameCheck = false;

register("worldLoad", () => {
    if (!Settings.autoCheckBookmarks) return;
    let stillInWorld = true;
    let registered = register("worldLoad", () => stillInWorld = false);
    setTimeout(() => {
        if (!stillInWorld) return registered.unregister();
        if (!TabList.getFooter()) return;
        if (TabList.getFooter().split("\n").length < 4) return;
        let match = TabList.getFooter().split("\n")[1].match(/^§r§r§fYou are in §r(.*)§r§f, by §r§7(.*)§r/);
        if (match) {
            ChatLib.command("map");
            nameCheck = true;
            setTimeout(() => {
                if (!stillInWorld) return registered.unregister();
                nameCheck = false;
            }, 1000);
        }
    }, 200);
});

register("chat", (event) => {
    if (!nameCheck) return;
    let [_match, huid, name] = ChatLib.getChatMessage(event).match(/§aYou are currently playing on §e(.*) \((.*)\)/);
    event.setCanceled(true);
    huid = huid.replaceAll("-", "");
    nameCheck = false;

    let bookmark = bookmarks.find(n => n.huid == huid);
    if (bookmark) {
        if (bookmark.name == name) return;
        bookmark.name = name;
        FileLib.write("HousingBrowser", "/data/bookmarks.json", JSON.stringify(bookmarks));
    }
}).setCriteria(/You are currently playing on (?:.*) (?:.*)/);

// Remove bookmark command
function removeBookmark(args) {
    if (args.shift() == "remove") {
        let oldBookmarks = bookmarks.length;
        bookmarks = bookmarks.filter(n => ChatLib.removeFormatting(n.name).toLowerCase().replace(/[^a-z0-9_]/g, "") != args.join(" ").toLowerCase().replace(/[^a-z0-9_]/g, ""));
        if (oldBookmarks != bookmarks.length) {
            ChatLib.chat("&3[HousingBrowser] &fSuccessfully removed bookmark");
            FileLib.write("HousingBrowser", "/data/bookmarks.json", JSON.stringify(bookmarks));
        } else {
            ChatLib.chat("&3[HousingBrowser] &cCouldn't find any matching bookmarks...");
        }
    } else {
        ChatLib.chat("&3[HousingBrowser] &cUnknown command, please use &e/bookmark &cor &e/bookmark remove");
    }
}