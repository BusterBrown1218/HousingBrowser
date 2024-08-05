/// <reference types="../../CTAutocomplete" />
import { House } from "./house";

const category = {
    POPULAR: { display: "Most Popular", key: 0 },
    UNPOPULAR: { display: "Least Popular", key: 1 },
    COOKIES: { display: "Most Cookies", key: 2 },
    UNCOOKIES: { display: "Least Cookies", key: 3 },
    BOOKMARK: { display: "Bookmarked", key: 4 },
    FEATURED: { display: "Featured Housing", key: 5 },
    RANDOM: { display: "Random Housing", key: 6 },
    NEWEST: { display: "Newest Housing", key: 7 },
    FRIENDS: { display: "Friends-in Housing", key: 8 },
}

let houses;
let gui = new Gui();
let categories;
try {
    categories = JSON.parse(FileLib.read("HousingBrowser", `/data/categories.json`)).map(n => { return category[n] });
} catch (e) {
    FileLib.write("HousingBrowser", `/data/categories.json`, JSON.stringify(["POPULAR", "COOKIES", "FEATURED"]), true);
    categories = [category.POPULAR, category.COOKIES, category.FEATURED];
}
let categorizedData = [];
let pages = [0, 0, 0];
let categorySelector = -1;

gui.registerDraw((mousex, mousey) => {
    let width = Renderer.screen.getWidth();
    let height = Renderer.screen.getHeight();
    let scaledOne = (2 / (Client.getSettings().getSettings().field_74335_Z == 0 ? 4 : Client.getSettings().getSettings().field_74335_Z));

    Renderer.drawRect(Renderer.color(20, 20, 20), width / 14 - 5, height / 8 - 5, width * 6 / 7 + 10, height * 3 / 4 + 5);

    Renderer.drawRect(Renderer.color(50, 50, 50), width / 2 - Renderer.getStringWidth("HousingBrowser") * scaledOne - 5 * scaledOne, height / 8 - 20 * scaledOne, Renderer.getStringWidth("HousingBrowser") * 2 * scaledOne + 10 * scaledOne, 25 * scaledOne);
    new Text("&3HousingBrowser", 0, 0).setScale(2 * scaledOne).setShadow(true).draw(width / 2 - Renderer.getStringWidth("HousingBrowser") * scaledOne, height / 8 - 15 * scaledOne);


    for (let i = 0; i < categories.length; i++) {
        if (categorizedData[i].length == 0) {
            new Text("&7No housings here :/").setScale(1.5 * scaledOne).setShadow(true).draw(width / 14, height / 8 + height * i / 4 + 15 * scaledOne);
        } else {
            categorizedData[i].slice(pages[i] * 7, pages[i] * 7 + 7).forEach((n, j) => {
                if (!n.ready) n.updateUser();
                n.render(width / 14 + (width * 6 / 49) * j + 2, height / 8 + 20 + height * i / 4, width * 6 / 49 - 5, height / 4, mousex, mousey);
            });
        }
        
        // left/right page buttons
        if (pages[i] * 7 + 7 < categorizedData[i].length) {
            Renderer.drawRect(Renderer.color(60, 60, 60), width * 13 / 14 - 10, height * 2 / 8 + 35 + height * i / 4, 10 * scaledOne, 10 * scaledOne);
            new Text("&f>").setScale(scaledOne).draw(width * 13 / 14 - 8, height * 2 / 8 + 37 + height * i / 4);
        }
        if (pages[i] > 0) {
            Renderer.drawRect(Renderer.color(60, 60, 60), width / 14, height * 2 / 8 + 35 + height * i / 4, 10 * scaledOne, 10 * scaledOne);
            new Text("&f<").setScale(scaledOne).draw(width / 14 + 2, height * 2 / 8 + 37 + height * i / 4);
        }

        let selectorBounds = { x: width / 14 - 2, width: Renderer.getStringWidth(categories[i].display + " &f⬎") * 1.5 * scaledOne + 4, y: height / 8 + height * i / 4 - 2, height: 15 * scaledOne }
        let color;
        if (
            mousex > selectorBounds.x &&
            mousex < selectorBounds.x + selectorBounds.width &&
            mousey > selectorBounds.y &&
            mousey < selectorBounds.y + selectorBounds.height
        ) {
            color = Renderer.color(80, 80, 80);
        } else {
            color = Renderer.color(40, 40, 40)
        }
        Renderer.drawRect(color, selectorBounds.x, selectorBounds.y, selectorBounds.width, selectorBounds.height);
        new Text("&7" + categories[i].display + " &f⬎", 0, 0).setScale(1.5 * scaledOne).draw(width / 14, height / 8 + height * i / 4);
        if (categories[i] == category.FEATURED) {
            new Text("&8(not selected by Hypixel)", 0, 0).setScale(0.5 * scaledOne).draw(width / 14 + Renderer.getStringWidth("&7" + categories[i].display + " &f⬎") * 1.5 * scaledOne + 5 * scaledOne, height / 8 + height * i / 4 + 5 * scaledOne);
        }
    }

    // Category selector
    if (categorySelector != -1) {
        let selectionOptions = Object.keys(category).filter(key => !categories.includes(category[key]));
        for (let i = 0; i < selectionOptions.length; i++) {
            let selectorBounds = { x: width / 14 - 2, width: Renderer.getStringWidth(categories[categorySelector].display + " &f⬎") * 1.5 * scaledOne + 4 * scaledOne, y: height / 8 + height * categorySelector / 4 + 10 * (i + 1) * scaledOne + 3 * scaledOne, height: 10 * scaledOne }
            let color;
            if (
                mousex > selectorBounds.x &&
                mousex < selectorBounds.x + selectorBounds.width &&
                mousey > selectorBounds.y &&
                mousey < selectorBounds.y + selectorBounds.height
            ) {
                color = Renderer.color(80, 80, 80);
            } else {
                color = Renderer.color(40, 40, 40)
            }
            Renderer.drawRect(color, selectorBounds.x, selectorBounds.y, selectorBounds.width, selectorBounds.height);
            new Text(category[selectionOptions[i]].display).setScale(scaledOne).draw(width / 14, height / 8 + height * categorySelector / 4 + 10 * (i + 1) * scaledOne + 4 * scaledOne);
        }
    }
});

gui.registerClicked((mousex, mousey) => {
    let width = Renderer.screen.getWidth();
    let height = Renderer.screen.getHeight();
    let scaledOne = (2 / (Client.getSettings().getSettings().field_74335_Z == 0 ? 4 : Client.getSettings().getSettings().field_74335_Z));
    for (let i = 0; i < categories.length; i++) {
        if (categorySelector > -1 && categorySelector != i) continue;
        let selectorBounds = { x: width / 14 - 2, width: Renderer.getStringWidth(categories[i].display + " &f⬎") * 1.5 * scaledOne + 4, y: height / 8 + height * i / 4 - 2, height: 15 * scaledOne }
        if (
            mousex > selectorBounds.x &&
            mousex < selectorBounds.x + selectorBounds.width &&
            mousey > selectorBounds.y &&
            mousey < selectorBounds.y + selectorBounds.height
        ) {
            if (categorySelector == i) categorySelector = -1;
            else categorySelector = i;
            World.playSound("random.click", 1, 1);
            return;
        }
        if (categorySelector == i) {
            let selectionOptions = Object.keys(category).filter(key => !categories.includes(category[key]));
            for (let j = 0; j < selectionOptions.length; j++) {
                let selectorBounds = { x: width / 14 - 2, width: Renderer.getStringWidth(categories[categorySelector].display + " &f⬎") * 1.5 * scaledOne + 4, y: height / 8 + height * categorySelector / 4 + 10 * (j + 1) * scaledOne + 3 * scaledOne, height: 10 * scaledOne }
                if (
                    mousex > selectorBounds.x &&
                    mousex < selectorBounds.x + selectorBounds.width &&
                    mousey > selectorBounds.y &&
                    mousey < selectorBounds.y + selectorBounds.height
                ) {
                    pages[i] = 0;
                    categories[i] = category[selectionOptions[j]];
                    FileLib.write("HousingBrowser", `/data/categories.json`, JSON.stringify(categories.map(n => { return Object.keys(category).find(key => n.key == category[key].key) })), true);
                    sortHouses(i);
                    World.playSound("random.click", 1, 1);
                }
            }
            categorySelector = -1;
            return;
        }
        for (let j = 0; j < 7 && j < categorizedData[i].length; j++) {
            if (
                mousex > width / 14 + (width * 6 / 49) * j + 2 &&
                mousex < width / 14 + (width * 6 / 49) * j + 2 + width * 6 / 49 - 5 &&
                mousey > height / 8 + 20 + height * i / 4 &&
                mousey < height / 8 + 20 + height * i / 4 + height / 8 + 10
            ) {
                categorizedData[i][j + pages[i] * 7].visit();
                gui.close();
                World.playSound("random.click", 1, 1);
                return;
            }
        }
        if (pages[i] * 7 + 7 < categorizedData[i].length) {
            if (
                mousex > width * 13 / 14 - 10 &&
                mousex < width * 13 / 14 - 10 + 10 &&
                mousey > height * 2 / 8 + 35 + height * i / 4 &&
                mousey < height * 2 / 8 + 35 + height * i / 4 + 10
            ) {
                pages[i]++;
                World.playSound("random.click", 1, 1);
                return;
            }
        }
        if (pages[i] > 0) {
            if (
                mousex > width / 14 &&
                mousex < width / 14 + 10 &&
                mousey > height * 2 / 8 + 35 + height * i / 4 &&
                mousey < height * 2 / 8 + 35 + height * i / 4 + 10
            ) {
                pages[i]--;
                World.playSound("random.click", 1, 1);
                return;
            }
        }
    }
});

export let browser = {
    gui,
    open: houseData => {
        houses = [];
        categorySelector = -1;
        pages = [0, 0, 0];
        gui.open();
        houseData.forEach((n) => {
            houses.push(new House(n.name, n.owner, n.players, n.cookies.current, n.uuid, n.createdAt, n.featured));
        });

        for (let i = 0; i < categories.length; i++) {
            sortHouses(i);
        }
    },
}

let friendScan = -1;

function sortHouses(i) {
    switch (categories[i]) {
        case category.POPULAR:
            categorizedData[i] = [...houses].filter(n => n.players >= 1).sort((a, b) => { return b.players - a.players });
            break;
        case category.UNPOPULAR:
            categorizedData[i] = [...houses].filter(n => n.players >= 1).sort((a, b) => { return a.players - b.players });
            break;
        case category.COOKIES:
            categorizedData[i] = [...houses].filter(n => n.players >= 1).sort((a, b) => { return b.cookies - a.cookies });
            break;
        case category.UNCOOKIES:
            categorizedData[i] = [...houses].filter(n => n.players >= 1).sort((a, b) => { return a.cookies - b.cookies });
            break;
        case category.BOOKMARK:
            let bookmarks;
            if (FileLib.exists("HousingBrowser", "/data/bookmarks.json")) bookmarks = JSON.parse(FileLib.read("HousingBrowser", "/data/bookmarks.json"));
            else bookmarks = [];
            bookmarks.forEach((bookmark) => {
                if (houses.some(n => n.huid == bookmark.huid)) return;
                houses.push(new House(bookmark.name, bookmark.owner, 0, "?", bookmark.huid));
            });
            categorizedData[i] = [...houses].filter(n => bookmarks.some(bookmark => n.huid == bookmark.huid)).sort((a, b) => { return b.players - a.players });
            break;
        case category.FEATURED:
            categorizedData[i] = [...houses].filter(n => n.featured == true).sort((a, b) => b.players - a.players);
            break;
        case category.RANDOM:
            categorizedData[i] = shuffleArray(...houses).filter(n => n.players >= 1);
            break;
        case category.NEWEST:
            categorizedData[i] = [...houses].filter(n => n.players >= 1).sort((a, b) => { return b.createdAt - a.createdAt });
            break;
        case category.FRIENDS:
            categorizedData[i] = [];
            friendScan = 0;
            inHouses = [];
            ChatLib.command(`fl ${friendScan + 1}`);
            break;
    }
}

let inHouses = [];

gui.registerClosed(() => { friendScan = -1 });

register("chat", (_friends, page, _pageAmount, fl, event) => {
    if (page != friendScan + 1) return;
    let message = ChatLib.getChatMessage(event);
    event.setCanceled(true);
    try {
        inHouses.push(...message.match(/§eis in the house ([^\n]*)/g).map(n => "&a" + n.substring(18).replaceAll("§", "&")));
    } catch (e) { }

    if (message.includes("§cis currently offline")) {
        friendScan = -1;
    } else {
        friendScan++;
        setTimeout(() => {
            if (friendScan == -1) return;
            ChatLib.command(`fl ${friendScan + 1}`);
        }, 1500);
    }
    categorizedData[categories.indexOf(category.FRIENDS)] = [...houses].filter(n => inHouses.includes(n.name)).sort((a, b) => { return b.players - a.players });
}).setCriteria("-----------------------------------------------------\n${friends} (Page ${page} of ${pageAmount})${fl}");

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}