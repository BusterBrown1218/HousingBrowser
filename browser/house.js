import { request } from "axios";

let cachedIgns = {};

const MCItemStack = Java.type("net.minecraft.item.ItemStack");

function getItemFromString(nbt) {
    return new Item(MCItemStack.func_77949_a(net.minecraft.nbt.JsonToNBT.func_180713_a(nbt)));
}

function formatUuid(uuid) {
    let part1 = uuid.substring(0, 8);
    let part2 = uuid.substring(8, 12);
    let part3 = uuid.substring(12, 16);
    let part4 = uuid.substring(16, 20);
    let part5 = uuid.substring(20);

    return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

export class House {
    name;
    owner;
    players;
    cookies;
    uuid;
    huid;
    createdAt;
    featured;
    ready = false;
    gettingUser = false;
    skull;

    constructor(name, owner, players, cookies, huid, createdAt, featured, uuidCache) {
        [this.name, this.players, this.cookies, this.uuid, this.huid, this.createdAt, this.featured] = ["&a" + name.replaceAll("§", "&"), players, cookies, owner, huid, createdAt, featured];
        // this.skull = getItemFromString("{id:\"minecraft:skull\",Count:1,Damage:3}");
        this.skull = getItemFromString(`{id:"minecraft:skull",Count:1,tag:{SkullOwner:{id:"${owner}"}},Damage:3}`);
        if (!uuidCache) return;
        if (cachedIgns[this.uuid] === undefined) {
            request({
                url: `https://api.mojang.com/user/profile/${this.uuid}`,
                method: "GET"
            }).then(res => {
                this.owner = res.data.name;
                // request({
                //     url: `https://sessionserver.mojang.com/session/minecraft/profile/${this.uuid}`,
                //     method: "GET"
                // }).then(response => {
                //     this.skull = getItemFromString(`{id:"minecraft:skull",Count:1,tag:{SkullOwner:{Id:"${formatUuid(this.uuid)}",Properties:{textures:[0:{Value:"${response.data.properties[0].value}"}]}}},Damage:3}`);
                //     this.gettingUser = false;
                //     cachedIgns[this.uuid] = { user: this.owner, skull: this.skull }
                //     this.ready = true;
                // });
            });
        } else {
            this.owner = cachedIgns[this.uuid].user;
            // this.skull = cachedIgns[this.uuid].skull;
            this.ready = true;
            this.gettingUser = false;
        }
    }

    render(x, y, width, height, mousex, mousey) {
        let scaledPadding = Math.floor(5 * width / 122);
        let scaledOne = (2 / (Client.getSettings().getSettings().field_74335_Z == 0 ? 4 : Client.getSettings().getSettings().field_74335_Z));

        if (mousex < x + width && mousex > x && mousey < y + scaledPadding * 2 + 24 * scaledOne + height / 4 && mousey > y) {
            Renderer.drawRect(Renderer.color(200, 200, 200, 50), x - scaledPadding / 2, y - scaledPadding / 2, width + scaledPadding, height / 4 + scaledPadding * 3 + 24 * scaledOne);
        }

        Renderer.drawRect(Renderer.color(30, 30, 30), x, y, width, height / 4);
        let scale = Math.floor(((width - scaledPadding * 2) / Renderer.getStringWidth(this.name)) * 2) / 2;
        // let scale = Math.floor(((width - scaledPadding - height / 8) / Renderer.getStringWidth(this.name)) * 2) / 2;
        // if (10 * scale > height / 4) scale = Math.floor(10 * scale / (height / 4));
        if (scale == 0) scale = 0.5 * scaledOne;
        if (scale > 2 * scaledOne) scale = 2 * scaledOne;
        new Text(this.name, 0, 0).setScale(scale).setShadow(true).draw(x + width / 2 - Renderer.getStringWidth(this.name) * scale / 2, 2 + y + height / 8 - 5 * scale);
        Renderer.drawRect(Renderer.color(50, 50, 50), x, y + height / 4, width, scaledPadding * 2 + 24 * scaledOne);
        // new Text(this.name, 0, 0).setScale(scale).setShadow(true).draw(x + width / 2 - Renderer.getStringWidth(this.name) * scale / 2 + height / 8 + 2, 2 + y + height / 8 - 5 * scale);
        // Renderer.drawRect(Renderer.color(50, 50, 50), x, y + height / 4, width, scaledPadding * 2 + 24 * scaledOne);

        // Owner
        let length = Renderer.getStringWidth("╠ " + this.owner) * scaledOne + scaledPadding;
        if (length > width) {
            new Text(String("&7╠ &a" + this.owner).substring(0, this.owner.length - 2 - Math.floor((length - width) / (length / String("╠ " + this.owner).length))) + "...").setScale(scaledOne).draw(x + scaledPadding, y + height / 4 + scaledPadding);
        } else {
            new Text("&7╠ &a" + this.owner).setScale(scaledOne).draw(x + scaledPadding, y + height / 4 + scaledPadding);
        }

        // Cookies
        length = Renderer.getStringWidth("╠ Cookies: " + this.cookies) * scaledOne + scaledPadding;
        if (length > width) {
            new Text(String("&7╠ &fCookies:&6 " + this.cookies).substring(0, String("&7╠ &fCookies&6: " + this.cookies).length - 2 - Math.floor((length - width) / (length / String("╠ Cookies: " + this.cookies).length))) + "...").setScale(scaledOne).draw(x + scaledPadding, y + height / 4 + 8 * scaledOne + scaledPadding);
        } else {
            new Text("&7╠ &fCookies:&6 " + this.cookies).setScale(scaledOne).draw(x + scaledPadding, y + height / 4 + 8 * scaledOne + scaledPadding);
        }

        // Players
        length = Renderer.getStringWidth("╚ Players: " + this.players) * scaledOne + scaledPadding;
        if (length > width) {
            new Text(String("&7╚ &fPlayers:&e " + this.players).substring(0, String("&7╚ &fPlayers&e: " + this.players).length - 2 - Math.floor((length - width) / (length / String("╚ Players: " + this.players).length))) + "...").setScale(scaledOne).draw(x + scaledPadding, y + height / 4 + 16 * scaledOne + scaledPadding);
        } else {
            new Text("&7╚ &fPlayers:&e " + this.players).setScale(scaledOne).draw(x + scaledPadding, y + height / 4 + 16 * scaledOne + scaledPadding);
        }

        // Skull
        // scale = (height / 4 + 20 + scaledPadding / 2) / 16;
        // this.skull.draw(x + width / 2 - 8 * scale, y + height / 4 + 24 * scaledOne + scaledPadding / 2, scale);
        // scale = (height / 4 + 20 + scaledPadding / 2) / 64;
        // this.skull.draw(x + scaledPadding / 2, y + height / 4 - 1, scale);

        // this.skull.draw(x, y, (height / 4) / 16);
    }

    updateUser() {
        if (this.gettingUser) return;
        this.owner = "Fetching...";
        this.gettingUser = true;
        if (cachedIgns[this.uuid] === undefined) {
            request({
                url: `https://api.mojang.com/user/profile/${this.uuid}`,
                method: "GET"
            }).then(res => {
                this.owner = res.data.name;
                // request({
                //     url: `https://sessionserver.mojang.com/session/minecraft/profile/${this.uuid}`,
                //     method: "GET"
                // }).then(response => {
                //     this.skull = getItemFromString(`{id:"minecraft:skull",Count:1,tag:{SkullOwner:{Id:"${formatUuid(this.uuid)}",Properties:{textures:[0:{Value:"${response.data.properties[0].value}"}]}}},Damage:3}`);
                //     this.gettingUser = false;
                //     cachedIgns[this.uuid] = { user: this.owner, skull: this.skull }
                //     this.ready = true;
                // });
            });
        } else {
            this.owner = cachedIgns[this.uuid].user;
            // this.skull = cachedIgns[this.uuid].skull;
            this.ready = true;
            this.gettingUser = false;
        }
    }

    visit() {
        ChatLib.command(`visit ${formatUuid(this.uuid)}`);
    }
}